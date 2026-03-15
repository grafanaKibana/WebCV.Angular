import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to calculate and format duration between two dates
 */
@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  private readonly months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  transform(
    value: string,
    startYear: string,
    endMonth: string | null,
    endYear: string | null
  ): string {
    const startMonth = value;
    if (!startMonth || !startYear) {
      return '';
    }

    const startMonthIndex = this.months.indexOf(startMonth);
    const startYearNum = parseInt(startYear, 10);

    if (startMonthIndex === -1 || isNaN(startYearNum)) {
      return '';
    }

    let endMonthIndex: number;
    let endYearNum: number;

    if (endMonth && endYear && endMonth.trim() !== '' && endYear.trim() !== '') {
      endMonthIndex = this.months.indexOf(endMonth);
      endYearNum = parseInt(endYear, 10);

      if (endMonthIndex === -1 || isNaN(endYearNum)) {
        return '';
      }
    } else {
      // If no end date (current job), use current date
      const currentDate = new Date();
      endMonthIndex = currentDate.getMonth();
      endYearNum = currentDate.getFullYear();
    }

    // Calculate total months between dates
    const totalMonths = (endYearNum - startYearNum) * 12 + (endMonthIndex - startMonthIndex);

    if (totalMonths < 0) {
      return '';
    }

    // Convert to years and months
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    // Format the result
    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    }

    if (remainingMonths > 0) {
      parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`);
    }

    return parts.length > 0 ? parts.join(' ') : '';
  }
}

