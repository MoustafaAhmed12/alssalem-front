// student.guard.ts
import { Injectable } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { SettingsProfileComponent } from '../../pages/student/screens/profile/components/settings-profile/settings-profile.component';

@Injectable({
  providedIn: 'root',
})
export class StudentGuard {
  canDeactivate: CanDeactivateFn<SettingsProfileComponent> = (
    component: SettingsProfileComponent
  ) => {
    return component.canExit();
  };
}
