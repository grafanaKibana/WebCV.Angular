import { MonthShortPipe } from './month-short.pipe';

describe('MonthShortPipe', () => {
  let pipe: MonthShortPipe;

  beforeEach(() => {
    pipe = new MonthShortPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should convert all full month names to short names', () => {
    expect(pipe.transform('January')).toBe('Jan');
    expect(pipe.transform('February')).toBe('Feb');
    expect(pipe.transform('March')).toBe('Mar');
    expect(pipe.transform('April')).toBe('Apr');
    expect(pipe.transform('May')).toBe('May');
    expect(pipe.transform('June')).toBe('Jun');
    expect(pipe.transform('July')).toBe('Jul');
    expect(pipe.transform('August')).toBe('Aug');
    expect(pipe.transform('September')).toBe('Sep');
    expect(pipe.transform('October')).toBe('Oct');
    expect(pipe.transform('November')).toBe('Nov');
    expect(pipe.transform('December')).toBe('Dec');
  });

  it('should return empty string for empty input', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('should return empty string for null input', () => {
    const month = null as unknown as string;

    expect(pipe.transform(month)).toBe('');
  });

  it('should return empty string for undefined input', () => {
    const month = undefined as unknown as string;

    expect(pipe.transform(month)).toBe('');
  });

  it('should return original value for unknown month', () => {
    expect(pipe.transform('Smarch')).toBe('Smarch');
  });

  it('should be case-sensitive for month lookup', () => {
    expect(pipe.transform('january')).toBe('january');
  });
});
