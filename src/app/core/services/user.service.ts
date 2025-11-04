import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  getUsers(): Observable<User[]> {
    // Mock data for now
    return of([
      { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: '2', name: 'Regular User', email: 'user@example.com', role: 'user' }
    ]);
  }

  getCurrentUser(): Observable<User> {
    return of({ id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' });
  }
}