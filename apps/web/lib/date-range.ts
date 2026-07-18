export type PeriodOption = "today" | "this_week" | "this_month" | "custom";

export interface DateRange {
  dateFrom: string;
  dateTo: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONDAY_ISO_WEEKDAY = 1;

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const isoWeekday = result.getDay() === 0 ? 7 : result.getDay();
  result.setDate(result.getDate() - (isoWeekday - MONDAY_ISO_WEEKDAY));
  return result;
}

export function getPeriodRange(period: PeriodOption, customFrom: string, customTo: string): DateRange {
  const now = new Date();

  if (period === "today") {
    const today = toISODate(now);
    return { dateFrom: today, dateTo: today };
  }

  if (period === "this_week") {
    return { dateFrom: toISODate(startOfWeek(now)), dateTo: toISODate(now) };
  }

  if (period === "this_month") {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return { dateFrom: toISODate(startOfMonth), dateTo: toISODate(now) };
  }

  return { dateFrom: customFrom || toISODate(now), dateTo: customTo || toISODate(now) };
}

export function getPreviousPeriodRange({ dateFrom, dateTo }: DateRange): DateRange {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const durationMs = to.getTime() - from.getTime();

  const previousTo = new Date(from.getTime() - MS_PER_DAY);
  const previousFrom = new Date(previousTo.getTime() - durationMs);

  return { dateFrom: toISODate(previousFrom), dateTo: toISODate(previousTo) };
}

export function getTrendPercent(currentTotal: number, previousTotal: number): number {
  if (previousTotal === 0) {
    return currentTotal === 0 ? 0 : 100;
  }

  return Math.round(((currentTotal - previousTotal) / Math.abs(previousTotal)) * 100);
}
