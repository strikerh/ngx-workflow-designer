import { Injectable, InjectionToken } from '@angular/core';

export interface SidePageRef<T = any> {
  close(result?: T): void;
  data?: any;
}

export interface SidePageData {
  [key: string]: any;
}

export const SIDE_PAGE_DATA = new InjectionToken<any>('SIDE_PAGE_DATA');
export const SIDE_PAGE_REF = new InjectionToken<SidePageRef>('SIDE_PAGE_REF');

@Injectable({ providedIn: 'root' })
export class SidePageService {
  open(component: any, config?: any): SidePageRef {
    // Mock implementation for now
    console.log('Opening side page with component:', component, 'config:', config);
    return {
      close: (result?: any) => {
        console.log('Closing side page with result:', result);
      },
      data: config?.data,
    };
  }

  openSidePage(id: string, component: any, config?: any): SidePageRef {
    console.log('Opening side page with id:', id, 'component:', component, 'config:', config);
    return this.open(component, config);
  }
}
