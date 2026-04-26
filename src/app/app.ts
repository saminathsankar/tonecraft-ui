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
  themeMode: 'light' | 'dark' = 'light';
  activeDropdown: string | null = null;
  loading = false;
  results: any[] = [];
  selectedResult: any = null;
  filterTone = 'All';

  ngOnInit() {
    const saved = localStorage.getItem('themeMode');
    this.themeMode = (saved as any) || 'light';
    this.applyTheme();
  }

  toggleTheme() {
    this.themeMode = this.themeMode === 'light' ? 'dark' : 'light';
    console.log('themeMode:', this.themeMode);
    localStorage.setItem('themeMode', this.themeMode);
    this.applyTheme();
  }

  applyTheme() {
    const root = document.documentElement;
    const body = document.body;
    this.theme = this.themeMode;

    if (this.theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
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
          text: 'Generating random paragraphs can be an excellent way for writers to get their creative flow going at the beginning of the day. The writer has no idea what topic the random paragraph will be about when it appears. This forces the writer to use creativity to complete one of three common writing challenges. The writer can use the paragraph as the first one of a short story and build upon it. A second option is to use the random paragraph somewhere in a short story they create. The third option is to have the random paragraph be the ending paragraph in a short story. No matter which of these challenges is undertaken, the writer is forced to use creativity to incorporate the paragraph into their writing.',
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

  openPopup(result: any) {
    this.selectedResult = result;
  }

  closePopup() {
    this.selectedResult = null;
  }

  toggleDropdown(name: string) {
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  selectTone(value: string) {
    this.tone = value;
    this.activeDropdown = null;
  }

  selectFilter(filter: string) {
    this.filterTone = filter;
    this.activeDropdown = null;
  }

  getFilteredResults() {
    if (this.filterTone === 'All') {
      return this.results;
    }
    return this.results.filter((r) => r.title.includes(this.filterTone));
  }

  onFilterMouseEnter(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.style.backgroundColor = this.themeMode === 'dark' ? '#0f172a' : '#eef2ff';
  }

  onFilterMouseLeave(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.style.backgroundColor = 'transparent';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (!event.target.closest('.relative')) {
      this.activeDropdown = null;
    }
  }
}
