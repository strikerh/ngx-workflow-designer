import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslocoService {
  translate(key: string): string {
    // Mock translation service - returns the key as-is for now
    return key;
  }
}

@Pipe({
  name: 'transloco',
  standalone: true
})
export class TranslocoPipe implements PipeTransform {
  transform(key: string): string {
    // Mock translation pipe - returns the key as-is for now
    return key;
  }
}