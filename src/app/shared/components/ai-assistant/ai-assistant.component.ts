import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss',
})
export class AiAssistantComponent implements AfterViewChecked {
  geminiService = inject(GeminiService);

  isOpen = signal<boolean>(false);
  userInput = signal<string>('');

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private previousMessageCount = 0;
  private shouldScrollToBottom = false;

  toggleChat() {
    this.isOpen.update((v) => !v);
  }

  sendMessage() {
    const text = this.userInput();
    if (!text.trim()) return;

    this.geminiService.sendMessage(text);
    this.userInput.set('');

    // تفعيل الـ scroll للأسفل عند إرسال رسالة جديدة
    this.shouldScrollToBottom = true;
  }

  handleEnter(event: any) {
    if (event.shiftKey) {
      // Allow default behavior (new line)
      return;
    } else {
      // Prevent default (new line) and send message
      event.preventDefault();
      this.sendMessage();
    }
  }

  ngAfterViewChecked() {
    const currentMessageCount = this.geminiService.messages().length;

    // النزول للأسفل فقط إذا تم إضافة رسالة جديدة
    if (
      currentMessageCount > this.previousMessageCount ||
      this.shouldScrollToBottom
    ) {
      this.scrollToBottom();
      this.previousMessageCount = currentMessageCount;
      this.shouldScrollToBottom = false;
    }
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  // Enhanced Markdown Parser
  formatText(text: string): string {
    if (!text) return '';

    let formatted = text;

    // 1. Code Blocks (```language code ```)
    // We use a placeholder to protect code blocks from other formatting
    const codeBlocks: string[] = [];
    formatted = formatted.replace(
      /```(\w*)([\s\S]*?)```/g,
      (match, lang, code) => {
        const index = codeBlocks.length;
        // Escape HTML in code
        const escapedCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        codeBlocks.push(
          `<pre><div class="text-xs text-gray-400 mb-1">${lang || 'code'}</div><code>${escapedCode.trim()}</code></pre>`,
        );
        return `__CODE_BLOCK_${index}__`;
      },
    );

    // 2. Inline Code (`code`)
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 3. Headers (### Header)
    formatted = formatted.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // 4. Bold and Italic
    formatted = formatted.replace(
      /\*\*\*(.*?)\*\*\*/g,
      '<strong><em>$1</em></strong>',
    );
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 5. Unordered Lists (- item)
    // Wrap lists in <ul> only if they are not already wrapped (simple heuristic)
    // This simple regex replaces each line. For proper <ul> wrapping we'd need more logic,
    // but for simple chat, just converting lines works or we can use a block replacer.
    // Let's use a simpler line-by-line approach for safety or a block approach.

    // Block approach for Lists:
    formatted = formatted.replace(/((?:^-\s+.*\n?)+)/gm, (match) => {
      const items = match
        .trim()
        .split('\n')
        .map((line) => `<li>${line.replace(/^-\s+/, '')}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    });

    // 6. Ordered Lists (1. item)
    formatted = formatted.replace(/((?:^\d+\.\s+.*\n?)+)/gm, (match) => {
      const items = match
        .trim()
        .split('\n')
        .map((line) => `<li>${line.replace(/^\d+\.\s+/, '')}</li>`)
        .join('');
      return `<ol>${items}</ol>`;
    });

    // 7. Links ([text](url))
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank">$1</a>',
    );

    // 8. Newlines to <br> (but not inside ul/ol/pre tags ideally, but here we did pre first)
    // We need to be careful not to break HTML tags we just added.
    // A safe way is to replace newlines that are NOT inside tags, but that's complex regex.
    // Simpler: Replace \n with <br> but only if it's not followed by a block tag opening or closing.
    formatted = formatted.replace(/\n/g, '<br>');

    // Cleanup: remove multiple <br> after block elements
    formatted = formatted.replace(/<\/h[1-6]><br>/g, '</h$1>');
    formatted = formatted.replace(/<\/ul><br>/g, '</ul>');
    formatted = formatted.replace(/<\/ol><br>/g, '</ol>');
    formatted = formatted.replace(/<\/pre><br>/g, '</pre>');
    formatted = formatted.replace(
      /__CODE_BLOCK_(\d+)__/g,
      (match, index) => codeBlocks[parseInt(index)],
    );

    return `<div class="markdown-content">${formatted}</div>`;
  }
}
