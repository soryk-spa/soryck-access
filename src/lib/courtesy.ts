export type CourtesyConfig = {
  enabled: boolean;
  validUntil?: string | null; // HH:mm 24h
  priceAfter?: number | null;
};

export function parseTimeToMinutes(time: string): number | null {
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

export function getCourtesyPrice(now: string, cfg: CourtesyConfig): number | 'free' | null {
  if (!cfg.enabled) return null;
  const nowMin = parseTimeToMinutes(now);
  if (nowMin == null) return null;
  const untilMin = cfg.validUntil ? parseTimeToMinutes(cfg.validUntil) : null;

  if (untilMin != null && nowMin <= untilMin) return 'free';
  return typeof cfg.priceAfter === 'number' ? cfg.priceAfter : null;
}
