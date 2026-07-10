const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const JUST_NOW_LABEL = "hace un momento";

export function formatTimeAgo(isoDateTime: string): string {
  const elapsedMs = Date.now() - new Date(isoDateTime).getTime();

  if (elapsedMs < MINUTE_MS) {
    return JUST_NOW_LABEL;
  }

  if (elapsedMs < HOUR_MS) {
    const minutes = Math.floor(elapsedMs / MINUTE_MS);
    return `hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }

  if (elapsedMs < DAY_MS) {
    const hours = Math.floor(elapsedMs / HOUR_MS);
    return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }

  const days = Math.floor(elapsedMs / DAY_MS);
  return `hace ${days} ${days === 1 ? "día" : "días"}`;
}
