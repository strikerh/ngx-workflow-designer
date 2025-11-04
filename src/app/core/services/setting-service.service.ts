import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface NotificationUser {
  id: string;
  name: string;
  email: string;
  group?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  
  getNotificationUsers(): Observable<NotificationUser[]> {
    // Mock data for now
    return of([
      { id: '1', name: 'Admin Group', email: 'admin@example.com', group: 'administrators' },
      { id: '2', name: 'User Group', email: 'users@example.com', group: 'users' }
    ]);
  }

  getSettings(): Observable<any> {
    return of({
      notifications: true,
      theme: 'light'
    });
  }
}