import { inject, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private swUpdate = inject(SwUpdate);

  // constructor() {
  //   if (this.swUpdate.isEnabled) {
  //     this.swUpdate.versionUpdates.subscribe((event) => {
  //       if (event.type === 'VERSION_READY') {
  //         const update = confirm(
  //           'فيه تحديث جديد للموقع. تحب تعيد تحميل الصفحة؟'
  //         );
  //         if (update) {
  //           location.reload();
  //         }
  //       }
  //     });
  //   }
  // }
}
