import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return valid month-only range', () => {
    expect(pipe.transform('January', '2020', 'June', '2020')).toBe('5 months');
  });

  it('should return exactly 1 year', () => {
    expect(pipe.transform('January', '2020', 'January', '2021')).toBe('1 year');
  });

  it('should return multiple years and months', () => {
    expect(pipe.transform('March', '2020', 'July', '2022')).toBe('2 years 4 months');
  });

  it('should return singular month', () => {
    expect(pipe.transform('January', '2020', 'February', '2020')).toBe('1 month');
  });

  it('should return empty string for same month and year', () => {
    expect(pipe.transform('January', '2020', 'January', '2020')).toBe('');
  });

  it('should return non-empty string for current job with null end date', () => {
    const result = pipe.transform('January', '2020', null, null);

    expect(result).not.toBe('');
  });

  it('should return non-empty string for current job with empty end date', () => {
    const result = pipe.transform('January', '2020', '', '');

    expect(result).not.toBe('');
  });

  it('should return empty string when start month is missing', () => {
    expect(pipe.transform('', '2020', 'June', '2020')).toBe('');
  });

  it('should return empty string when start year is missing', () => {
    expect(pipe.transform('January', '', 'June', '2020')).toBe('');
  });

  it('should return empty string for invalid start month name', () => {
    expect(pipe.transform('InvalidMonth', '2020', 'June', '2020')).toBe('');
  });

  it('should return empty string for invalid start year', () => {
    expect(pipe.transform('January', 'abc', 'June', '2020')).toBe('');
  });

  it('should return empty string for negative duration', () => {
    expect(pipe.transform('June', '2022', 'January', '2020')).toBe('');
  });

  it('should return empty string for invalid end month', () => {
    expect(pipe.transform('January', '2020', 'InvalidMonth', '2020')).toBe('');
  });

  it('should return empty string for invalid end year', () => {
    expect(pipe.transform('January', '2020', 'June', 'abc')).toBe('');
  });

  it('should return 1 year for exactly 12 months', () => {
    expect(pipe.transform('January', '2020', 'January', '2021')).toBe('1 year');
  });

  it('should return large duration correctly', () => {
    expect(pipe.transform('January', '2015', 'March', '2025')).toBe('10 years 2 months');
  });

  describe('sub-month duration for current jobs', () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    it('should return days format when current job started this month', () => {
      const now = new Date();
      const result = pipe.transform(monthNames[now.getMonth()], now.getFullYear().toString(), null, null);

      if (now.getDate() > 1) {
        expect(result).toMatch(/^\d+ days?$/);
      } else {
        expect(result).toBe('');
      }
    });

    it('should return empty string for completed job with same start and end month', () => {
      expect(pipe.transform('January', '2020', 'January', '2020')).toBe('');
    });

    it('should return "Starting in X days" when current job starts in future month', () => {
      const future = new Date();
      future.setMonth(future.getMonth() + 2);
      const futureMonth = monthNames[future.getMonth()];
      const futureYear = future.getFullYear().toString();

      expect(pipe.transform(futureMonth, futureYear, null, null)).toMatch(/^Starting in \d+ days?$/);
    });

    it('should return empty string for completed job with negative duration', () => {
      expect(pipe.transform('June', '2022', 'January', '2020')).toBe('');
    });
  });
});
