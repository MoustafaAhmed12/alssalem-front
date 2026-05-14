import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertMinutesToTime',
  standalone: true,
})
export class ConvertMinutesToTimePipe implements PipeTransform {
  transform(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${this.padZero(hours)}:${this.padZero(mins)}:00`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
