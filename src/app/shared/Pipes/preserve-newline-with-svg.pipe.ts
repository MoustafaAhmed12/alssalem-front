import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Pipe({
  name: 'preserveNewlineWithSvg',
  standalone: true,
})
export class PreserveNewlineWithSvgPipe implements PipeTransform {
  // private svg: string = `<svg width="8" height="8" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; display: inline-block;">
  //                         <circle cx="5" cy="5" r="5" fill="black"/>
  //                       </svg>`;
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    if (!value) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    const lines = value.split('\n');
    const linesWithSvg = lines.map((line) => {
      if (line.trim()) {
        // return `${this.svg} ${line}`;
        return `${line}`;
      }
      return line;
    });
    const html = linesWithSvg.join('<br/>');
    return this.sanitizer.bypassSecurityTrustHtml(
      `<div style="line-height: 2;">${html}</div>`
    );
  }
}
