// utils/dateUtils.js
function parseLocalStartOfDayFromYYYYMMDD(dateStr) {
  // acepta "YYYY-MM-DD" o Date/ISO string
  if (!dateStr) return null;
  // Si ya es Date
  if (dateStr instanceof Date) {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  // si viene "YYYY-MM-DD" o "YYYY-MM-DDTHH:MM:SS"
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]) - 1;
  const d = Number(parts[2]);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  return new Date(y, m, d); // 00:00 local
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date) {
  const e = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  e.setHours(23, 59, 59, 999);
  return e;
}

module.exports = {
  parseLocalStartOfDayFromYYYYMMDD,
  startOfDay,
  endOfDay,
};
