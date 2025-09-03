import { getCourtesyPrice } from './courtesy';

describe('courtesy pricing', () => {
  it('is free before or at limit time', () => {
    expect(getCourtesyPrice('23:30', { enabled: true, validUntil: '23:59', priceAfter: 6000 })).toBe('free');
    expect(getCourtesyPrice('00:00', { enabled: true, validUntil: '00:00', priceAfter: 6000 })).toBe('free');
  });

  it('charges fixed price after limit', () => {
    expect(getCourtesyPrice('00:01', { enabled: true, validUntil: '00:00', priceAfter: 6000 })).toBe(6000);
  });

  it('returns null when disabled', () => {
    expect(getCourtesyPrice('12:00', { enabled: false, validUntil: '00:00', priceAfter: 6000 })).toBeNull();
  });

  it('handles invalid time gracefully', () => {
    expect(getCourtesyPrice('invalid', { enabled: true, validUntil: '00:00', priceAfter: 6000 })).toBeNull();
  });
});
