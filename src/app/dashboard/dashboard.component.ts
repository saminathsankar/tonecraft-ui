import { Component, OnInit, OnDestroy, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserCountService } from '../services/user-count.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  liveCount = 0;
  displayedCount = 0;
  isDev = isDevMode();
  private sub?: Subscription;
  private animFrame?: number;

  constructor(
    private userCountService: UserCountService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (!isDevMode()) {
      this.router.navigate(['/']);
      return;
    }
    this.liveCount = this.userCountService.currentCount;
    this.displayedCount = this.liveCount;
    this.sub = this.userCountService.count$.subscribe(count => {
      this.liveCount = count;
      if (this.displayedCount !== count) {
        this.animateCountUp();
      }
    });
  }

  private animateCountUp() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    const start = this.displayedCount;
    const end = this.liveCount;
    const duration = 1200;
    const startTime = performance.now();
    const step = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayedCount = Math.floor(start + (end - start) * eased);
      if (progress < 1) {
        this.animFrame = requestAnimationFrame(step);
      }
    };
    this.animFrame = requestAnimationFrame(step);
  }

  resetCount() {
    this.userCountService.reset();
    this.liveCount = 0;
    this.displayedCount = 0;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }
}
