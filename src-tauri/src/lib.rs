use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine as _};
use std::{
    path::{Path, PathBuf},
    sync::{Arc, Mutex},
};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;

#[derive(Clone, Default)]
struct SaveState {
    last_directory: Arc<Mutex<Option<PathBuf>>>,
}

fn ensure_format_extension(mut path: PathBuf, format: &str) -> PathBuf {
    let current_extension = path
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();

    let extension_matches = match format {
        "png" => current_extension == "png",
        "jpeg" => matches!(current_extension.as_str(), "jpg" | "jpeg"),
        _ => false,
    };

    if !extension_matches {
        path.set_extension(if format == "jpeg" { "jpg" } else { "png" });
    }
    path
}

#[tauri::command]
async fn save_image(
    app: AppHandle,
    state: State<'_, SaveState>,
    suggested_name: String,
    format: String,
    base64_data: String,
) -> Result<Option<String>, String> {
    if !matches!(format.as_str(), "png" | "jpeg") {
        return Err("対応していない画像形式です。".into());
    }

    let last_directory = state.last_directory.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let mut dialog = app
            .dialog()
            .file()
            .set_title("完成画像を保存")
            .set_file_name(suggested_name)
            .add_filter(
                if format == "jpeg" {
                    "JPEG画像"
                } else {
                    "PNG画像"
                },
                if format == "jpeg" {
                    &["jpg", "jpeg"]
                } else {
                    &["png"]
                },
            );

        let initial_directory = last_directory
            .lock()
            .ok()
            .and_then(|directory| directory.clone())
            .or_else(|| app.path().picture_dir().ok());
        if let Some(directory) = initial_directory {
            dialog = dialog.set_directory(directory);
        }

        let Some(selected_path) = dialog.blocking_save_file() else {
            return Ok(None);
        };
        let selected_path = selected_path
            .into_path()
            .map_err(|error| format!("保存先を取得できませんでした: {error}"))?;
        let selected_path = ensure_format_extension(selected_path, &format);
        let bytes = BASE64_STANDARD
            .decode(base64_data)
            .map_err(|error| format!("画像データを変換できませんでした: {error}"))?;

        std::fs::write(&selected_path, bytes)
            .map_err(|error| format!("画像を保存できませんでした: {error}"))?;

        if let Some(parent) = selected_path.parent().map(Path::to_path_buf) {
            if let Ok(mut directory) = last_directory.lock() {
                *directory = Some(parent);
            }
        }

        Ok(Some(selected_path.to_string_lossy().into_owned()))
    })
    .await
    .map_err(|error| format!("保存処理を完了できませんでした: {error}"))?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(SaveState::default())
        .invoke_handler(tauri::generate_handler![save_image])
        .run(tauri::generate_context!())
        .expect("error while running Tarot Spread Canvas");
}

#[cfg(test)]
mod tests {
    use super::ensure_format_extension;
    use std::path::PathBuf;

    #[test]
    fn keeps_supported_extensions() {
        assert_eq!(
            ensure_format_extension(PathBuf::from("reading.PNG"), "png"),
            PathBuf::from("reading.PNG")
        );
        assert_eq!(
            ensure_format_extension(PathBuf::from("reading.jpeg"), "jpeg"),
            PathBuf::from("reading.jpeg")
        );
    }

    #[test]
    fn normalizes_missing_or_mismatched_extensions() {
        assert_eq!(
            ensure_format_extension(PathBuf::from("reading"), "png"),
            PathBuf::from("reading.png")
        );
        assert_eq!(
            ensure_format_extension(PathBuf::from("reading.png"), "jpeg"),
            PathBuf::from("reading.jpg")
        );
    }
}
