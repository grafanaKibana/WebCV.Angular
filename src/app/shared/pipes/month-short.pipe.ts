import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe to convert full month names to short abbreviations
 */
@Pipe({
  name: 'monthShort',
  standalone: true
})
export class MonthShortPipe implements PipeTransform {
  private readonly monthMap: { [key: string]: string } = {
    'January': 'Jan',
    'February': 'Feb',
    'March': 'Mar',
    'April': 'Apr',
    'May': 'May',
    'June': 'Jun',
    'July': 'Jul',
    'August': 'Aug',
    'September': 'Sep',
    'October': 'Oct',
    'November': 'Nov',
    'December': 'Dec'
  };

  transform(month: string): string {
    if (!month) {
      return '';
    }
    return this.monthMap[month] || month;
  }
}
