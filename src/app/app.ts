import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
})
export class App {
  inputText = '';
  tone = 'Professional';
  context = 'Work';
  length = 'Short';
  theme: 'light' | 'dark' = 'light';
  activeDropdown: string | null = null;
  loading = false;
  results: any[] = [];

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    this.theme = (saved as any) || 'light';
    this.applyTheme();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  applyTheme() {
    const root = document.documentElement;

    if (this.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  generate() {
    if (!this.inputText) return;

    this.loading = true;
    this.results = [];

    setTimeout(() => {
      this.results = [
        {
          title: 'Professional Version',
          text: 'I will not be able to attend tomorrow due to prior commitments.',
        },
        {
          title: 'Friendly Version',
          text: 'Hey, I can’t make it tomorrow, got caught up with something.',
        },
        {
          title: 'Polite Version',
          text: 'Sorry, I won’t be able to come tomorrow, hope you understand.',
        },
      ];
      this.loading = false;
    }, 1500);
  }

  copy(text: string) {
    navigator.clipboard.writeText(text);
    alert('Copied!');
  }

  toggleDropdown(name: string) {
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  selectTone(value: string) {
    this.tone = value;
    this.activeDropdown = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (!event.target.closest('.relative')) {
      this.activeDropdown = null;
    }
  }
}
