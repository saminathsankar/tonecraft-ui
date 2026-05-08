import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserCountService {
  private readonly storageKey = 'tc_user_count';
  private countSource = new BehaviorSubject<number>(this.loadCount());
  count$ = this.countSource.asObservable();

  private loadCount(): number {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
    } catch {
      return 0;
    }
  }

  private saveCount(count: number) {
    try {
      localStorage.setItem(this.storageKey, count.toString());
    } catch {}
  }

  increment(): number {
    const newCount = this.countSource.value + 1;
    this.countSource.next(newCount);
    this.saveCount(newCount);
    return newCount;
  }

  get currentCount(): number {
    return this.countSource.value;
  }

  reset() {
    this.countSource.next(0);
    this.saveCount(0);
  }
}
