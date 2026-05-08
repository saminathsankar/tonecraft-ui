import { Component, HostListener, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  showSplash = true;

  ngOnInit() {
    setTimeout(() => this.showSplash = false, 5000);
  }

  @HostListener('document:contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    if (!isDevMode()) {
      event.preventDefault();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!isDevMode()) {
      if (event.key === 'F12') {
        event.preventDefault();
      }
      if (event.ctrlKey && event.shiftKey && ['I', 'J', 'C', 'U'].includes(event.key.toUpperCase())) {
        event.preventDefault();
      }
    }
  }
}
