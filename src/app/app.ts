import { Component, HostListener, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateMLCEngine, type MLCEngine } from '@mlc-ai/web-llm';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
})
export class App {
  inputText = '';
  activeDropdown: string | null = null;
  loading = false;
  modelLoading = false;
  modelProgress = 0;
  modelLoaded = false;
  results: any[] = [];
  selectedResult: any = null;
  filterTone = 'All';
  showRestrictedPopup = false;
  showSplash = true;
  private engine: MLCEngine | null = null;
  private blockedWords = ['sex', 'porn', 'xxx', 'fuck', 'shit', 'ass', 'bitch', 'nude', 'naked', 'explicit', 'adult', 'bastard', 'dick', 'pussy', 'anal', 'hentai'];
  private isGenerating = false;

  ngOnInit() {
    setTimeout(() => this.showSplash = false, 5000);
  }
  private formatKeywords: Record<string, string[]> = {
    letter: ['letter', 'formal letter', 'business letter', 'cover letter'],
    email: ['email', 'mail', 'e-mail'],
    teams: ['teams', 'teams message', 'microsoft teams'],
    slack: ['slack', 'slack message'],
    chat: ['chat', 'message', 'sms', 'text message'],
    social: ['post', 'social media', 'linkedin', 'tweet', 'facebook'],
    presentation: ['presentation', 'slide', 'bullet point'],
  };

  detectFormat(text: string): string {
    const lower = text.toLowerCase();
    for (const [format, keywords] of Object.entries(this.formatKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) return format;
    }
    return 'general';
  }

  constructor(private zone: NgZone, private cdr: ChangeDetectorRef) {}

  isContentAppropriate(text: string): boolean {
    const lower = text.toLowerCase();
    return !this.blockedWords.some(word => lower.includes(word));
  }

  async initModel() {
    if (this.modelLoaded || this.engine) return;

    this.modelLoading = true;
    this.modelProgress = 0;

    try {
      this.engine = await CreateMLCEngine('Llama-3.2-1B-Instruct-q4f16_1-MLC', {
        initProgressCallback: (report) => {
          const match = report.text.match(/(\d+)%/);
          if (match) {
            this.zone.run(() => {
              this.modelProgress = parseInt(match[1], 10);
            });
          }
        },
      });

      this.modelLoaded = true;
      this.modelLoading = false;
    } catch (error) {
      console.error('Failed to load AI model:', error);
      this.modelLoading = false;
      this.results = [{ title: 'Error', text: 'Failed to load AI model. Check browser console for details.' }];
    }
  }

  async generate() {
    if (!this.inputText || !this.engine) return;

    this.loading = true;
    this.results = [];
    this.isGenerating = true;
    this.cdr.detectChanges();

    const detectedFormat = this.detectFormat(this.inputText);

    const formatPrompts: Record<string, string> = {
      letter: 'Rewrite as a formal letter with greeting and sign-off.',
      email: 'Rewrite as a professional email with subject and greeting.',
      teams: 'Rewrite as a concise Teams message.',
      slack: 'Rewrite as a casual Slack message.',
      chat: 'Rewrite as a short chat message.',
      social: 'Rewrite as a polished social media post.',
      presentation: 'Rewrite as presentation bullet points.',
      general: 'Improve clarity and impact.',
    };

    const toneAdjectives: Record<string, string[]> = {
      Professional: ['professional', 'formal'],
      Friendly: ['warm', 'friendly'],
      Polite: ['courteous', 'polite'],
    };

    const tones = Object.keys(toneAdjectives);
    const filteredTones = this.filterTone === 'All' ? tones : tones.filter(t => t === this.filterTone);

    try {
      for (const toneConfig of filteredTones) {
        const result = {
          title: toneConfig + ' Version',
          text: '',
        };
        this.results = [...this.results, result];
        this.cdr.detectChanges();

        const adjectives = toneAdjectives[toneConfig as keyof typeof toneAdjectives].join(' ');
        const formatPrompt = formatPrompts[detectedFormat];

        const stream = await this.engine!.chat.completions.create({
          messages: [
            { role: 'system', content: `You are a text-only writing assistant. ${formatPrompt} Use a ${adjectives} tone. Do NOT output errors, do NOT mention 'clipboard' or images. Output only the rewritten text.` },
            { role: 'user', content: this.inputText },
          ],
          max_tokens: 100,
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of stream as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            result.text += content;
            this.cdr.detectChanges();
          }
        }

        if (result.text.toLowerCase().includes('clipboard') || result.text.toLowerCase().includes('error:')) {
          result.text = 'Failed to generate. Please try again.';
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      this.results = [{ title: 'Error', text: 'Failed to generate. Please try again.' }];
    }

    this.loading = false;
    this.isGenerating = false;
    this.cdr.detectChanges();
  }

  async handleGenerate() {
    if (!this.inputText) return;

    if (!this.isContentAppropriate(this.inputText)) {
      this.showRestrictedPopup = true;
      return;
    }

    if (this.loading || this.modelLoading) {
      return;
    }

    if (!this.modelLoaded) {
      await this.initModel();
    }

    if (this.modelLoading) {
      return;
    }

    await this.generate();
  }

  async copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied!');
    } catch {
      alert('Failed to copy.');
    }
  }

  openPopup(result: any) {
    this.selectedResult = result;
  }

  closePopup() {
    this.selectedResult = null;
  }

  closeRestrictedPopup() {
    this.showRestrictedPopup = false;
  }

  toggleDropdown(name: string) {
    this.activeDropdown = this.activeDropdown === name ? null : name;
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
    target.style.backgroundColor = '#0f172a';
  }

  onFilterMouseLeave(event: MouseEvent) {
    const target = event.target as HTMLElement;
    target.style.backgroundColor = 'transparent';
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.activeDropdown = null;
    }
  }
}
