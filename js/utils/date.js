export function getLocalDateValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatDateForCanvas(value) {
  return value ? value.replaceAll("-", "/") : "";
}

export function formatReadingDate(dateState) {
  if (!dateState.enabled) return "";
  if (dateState.mode === "range") {
    const start = formatDateForCanvas(dateState.start);
    const end = formatDateForCanvas(dateState.end);
    if (start && end) return `${start} ～ ${end}`;
    return start || end;
  }
  return formatDateForCanvas(dateState.single);
}

export function createTimestamp(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join("");
}
