import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class HtmlSanitizerService {
  /**
   * Sanitizes untrusted user-authored HTML using a strict allowlist.
   * Strips scripts, event handlers, external resources, and dangerous URL protocols.
   */
  sanitize(untrustedHtml: string): string {
    if (!untrustedHtml || typeof untrustedHtml !== 'string') {
      return '';
    }

    return sanitizeHtml(untrustedHtml, {
      allowedTags: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'a', 'b', 'i', 'strong', 'em', 'strike', 'code', 'pre',
        'hr', 'br', 'div', 'span', 'blockquote',
        'ul', 'ol', 'li',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
      ],
      allowedAttributes: {
        a: ['href', 'title', 'target'],
        '*': ['style', 'class'],
      },
      allowedStyles: {
        '*': {
          color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/, /^[a-z]+$/],
          'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
          'font-size': [/^\d+(?:px|em|rem|%)$/],
          'font-family': [/.*/],
          'line-height': [/^\d+(?:\.\d+)?(?:px|em|rem|%)?$/],
          'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(/, /^[a-z]+$/],
          margin: [/^\d+(?:px|em|rem|%)(?:\s+\d+(?:px|em|rem|%))*$/],
          padding: [/^\d+(?:px|em|rem|%)(?:\s+\d+(?:px|em|rem|%))*$/],
          border: [/.*/],
          'border-radius': [/^\d+(?:px|em|rem|%)$/],
        },
      },
      allowedSchemes: [], // No external schemes (http, https, ftp)
      allowedSchemesByTag: {
        a: ['http', 'https'], // For links, transformed or checked
      },
      transformTags: {
        a: (tagName, attribs) => {
          let href = attribs.href ? attribs.href.trim() : '';
          // Strip javascript: or data: URIs
          if (/^(?:javascript|data|vbscript):/i.test(href)) {
            href = '#';
          }
          return {
            tagName: 'a',
            attribs: {
              ...attribs,
              href,
              target: '_self', // Prevent top-navigation breakout
            },
          };
        },
      },
      disallowedTagsMode: 'discard',
    });
  }

  /**
   * Extracts clean, plain, normalized text from HTML for search indexing.
   */
  extractSearchableText(html: string): string {
    if (!html) return '';

    return sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: {},
    })
      .replace(/\s+/g, ' ')
      .trim();
  }
}
