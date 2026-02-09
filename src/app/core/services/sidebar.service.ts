import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isExpandedSubject = new BehaviorSubject<boolean>(true);
  private isMobileOpenSubject = new BehaviorSubject<boolean>(false);
  private isHoveredSubject = new BehaviorSubject<boolean>(false);

  isExpanded$ = this.isExpandedSubject.asObservable();
  isMobileOpen$ = this.isMobileOpenSubject.asObservable();
  isHovered$ = this.isHoveredSubject.asObservable();

  get isExpanded(): boolean {
    return this.isExpandedSubject.value;
  }

  get isMobileOpen(): boolean {
    return this.isMobileOpenSubject.value;
  }

  get isHovered(): boolean {
    return this.isHoveredSubject.value;
  }

  toggleExpanded(): void {
    this.isExpandedSubject.next(!this.isExpandedSubject.value);
  }

  setExpanded(value: boolean): void {
    this.isExpandedSubject.next(value);
  }

  toggleMobileOpen(): void {
    this.isMobileOpenSubject.next(!this.isMobileOpenSubject.value);
  }

  setMobileOpen(value: boolean): void {
    this.isMobileOpenSubject.next(value);
  }

  setHovered(value: boolean): void {
    this.isHoveredSubject.next(value);
  }
}
