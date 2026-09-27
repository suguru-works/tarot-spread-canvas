# Background assets

正式背景はCanvas全面へcover相当で描画されます。画像が未配置または読み込みに失敗した場合は、コードで生成するフォールバック背景が使用されます。

| Theme | WebP | Dimensions | Quality | Source |
| --- | --- | --- | --- | --- |
| Cosmic | `cosmic.webp` | 1448 × 1086 | 90, method 6 | `source/cosmic.png` |
| Wood | `wood.webp` | 1292 × 1218 | 90, method 6 | `source/wood.png` |

元PNGは再変換用としてローカルの`source/`に保持します。公開時は`.gitignore`で除外し、アプリが使用するWebPだけをリポジトリへ含めます。
