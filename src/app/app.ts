import { Component, HostListener, NgZone } from '@angular/core';
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
  private engine: MLCEngine | null = null;
  private blockedWords = ['sex', 'porn', 'xxx', 'fuck', 'shit', 'ass', 'bitch', 'nude', 'naked', 'explicit', 'adult', 'bastard', 'dick', 'pussy', 'anal', 'hentai'];
  private autoGenerateTimer: any = null;

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

  constructor(private zone: NgZone) {}

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

    const detectedFormat = this.detectFormat(this.inputText);

    const formatPrompts: Record<string, string> = {
      letter: 'Rewrite this as a complete letter with greeting, body paragraphs, and sign-off.',
      email: 'Rewrite this as a professional email with subject, greeting, body, and sign-off.',
      teams: 'Rewrite this as a concise Microsoft Teams message.',
      slack: 'Rewrite this as a casual Slack message.',
      chat: 'Rewrite this as a short, clear chat message.',
      social: 'Rewrite this as a polished social media post.',
      presentation: 'Rewrite this as bullet points for a presentation slide.',
      general: 'Rewrite and enhance this text to make it clearer and more impactful.',
    };

    const toneAdjectives: Record<string, string[]> = {
      Professional: ['professional', 'formal', 'business-appropriate'],
      Friendly: ['warm', 'friendly', 'approachable'],
      Polite: ['courteous', 'respectful', 'polite'],
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

        const adjectives = toneAdjectives[toneConfig as keyof typeof toneAdjectives].join(', ');
        const formatPrompt = formatPrompts[detectedFormat];

        const stream = await this.engine!.chat.completions.create({
          messages: [
            { role: 'system', content: `${formatPrompt} Use a ${adjectives} tone. Preserve the original meaning. Output only the rewritten text.` },
            { role: 'user', content: this.inputText },
          ],
          max_tokens: 256,
          temperature: 0.7,
          stream: true,
        });

        for await (const chunk of stream as AsyncIterable<{ choices: Array<{ delta: { content?: string } }> }>) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            result.text += content;
            this.results = [...this.results];
          }
        }
      }
    } catch (error) {
      console.error('Generation failed:', error);
      this.results = [{ title: 'Error', text: 'Failed to generate. Please try again.' }];
    }

    this.loading = false;
  }

  onInputChange() {
    if (this.autoGenerateTimer) {
      clearTimeout(this.autoGenerateTimer);
    }
    if (!this.inputText.trim()) {
      this.results = [];
      return;
    }
    this.autoGenerateTimer = setTimeout(() => {
      if (!this.isContentAppropriate(this.inputText)) {
        return;
      }
      this.handleGenerate();
    }, 1500);
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
