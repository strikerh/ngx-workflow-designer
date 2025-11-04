import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * Markdown Help Pipe
 * 
 * Converts simple markdown-style text to HTML for helpText display.
 * Supports:
 * - Line breaks (\n)
 * - Bold text (**text**)
 * - Bullet points (• or - at start of line)
 * - Inline code (`code`)
 * - Emoji and special characters
 * 
 * Usage:
 * <div [innerHTML]="helpText | markdownHelp"></div>
 */
@Pipe({
  name: 'markdownHelp',
  standalone: true
})
export class MarkdownHelpPipe implements PipeTransform {
  
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | undefined | null): SafeHtml {
    if (!value) {
      return '';
    }

    let html = value;

    // Escape HTML entities first to prevent XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Convert line breaks to <br>
    html = html.replace(/\n/g, '<br>');

    // Convert bold text **text** to <strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-500">$1</strong>');

    // Convert inline code `code` to <code>
    html = html.replace(/`(.+?)`/g, '<code class="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">$1</code>');

    // Style bullet points at the beginning of lines
    html = html.replace(/(^|<br>)(•)(\s)/g, '$1<span class="inline-block w-4 text-slate-400">$2</span>$3');
    html = html.replace(/(^|<br>)(-)(\s)/g, '$1<span class="inline-block w-4 text-slate-400">•</span>$3');

    // Add spacing and style for emoji headers (📋, 📌, etc.)
    html = html.replace(/(📋|📌|⏰|📅|🔁|📆|🎯|✅|❌|⚡|🔧)/g, '<span class="font-medium mr-1">$1</span>');

    // Return sanitized HTML (bypass sanitizer since we manually escaped above)
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
