export const ITEMS_PER_PAGE = 8;
export const formatYYYYMM = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
export const formatISOWeek = (d: Date) => {
  // ISO week year/week
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // Thursday decides the week-year
  tmp.setUTCDate(tmp.getUTCDate() + 3 - ((tmp.getUTCDay() + 6) % 7));
  const weekYear = tmp.getUTCFullYear();
  // Week number
  const week1 = new Date(Date.UTC(weekYear, 0, 4));
  const weekNo = 1 + Math.round(((+tmp - +week1) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7);
  return `${weekYear}-W${String(weekNo).padStart(2, '0')}`;
};
export const getISOWeekStartEnd = (isoWeek: string) => {
  // isoWeek like "2025-W33"
  const m = /^(\d{4})-W(\d{2})$/.exec(isoWeek);
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // 1..7 Mon..Sun
  const week1Monday = new Date(Date.UTC(year, 0, 4 - (jan4Day - 1)));
  const start = new Date(Date.UTC(week1Monday.getUTCFullYear(), week1Monday.getUTCMonth(), week1Monday.getUTCDate() + (week - 1) * 7));
  const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6));
  return { start, end };
};