import { HtmlSanitizerService } from './html-sanitizer.service';

describe('HtmlSanitizerService (Defense-in-depth HTML Security)', () => {
  let service: HtmlSanitizerService;

  beforeEach(() => {
    service = new HtmlSanitizerService();
  });

  describe('XSS and Script Execution Prevention', () => {
    it('strips <script> tags and embedded executable code', () => {
      const malicious = '<div>Safe Content<script>alert("pwned!")</script></div>';
      const result = service.sanitize(malicious);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Safe Content');
    });

    it('strips inline event handlers (onload, onerror, onclick)', () => {
      const malicious = '<img src="x" onerror="alert(1)" /><p onclick="evil()">Click Me</p>';
      const result = service.sanitize(malicious);
      expect(result).not.toContain('onerror');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert(1)');
      expect(result).toContain('Click Me');
    });

    it('neutralizes javascript: and data: pseudo-protocols in links', () => {
      const malicious = '<a href="javascript:stealTokens()">Secret Link</a>';
      const result = service.sanitize(malicious);
      expect(result).not.toContain('javascript:stealTokens()');
      expect(result).toContain('href="#"');
    });

    it('discards embedded frames, objects, and form elements', () => {
      const malicious = `
        <iframe src="https://evil.com"></iframe>
        <object data="malware.swf"></object>
        <form action="/steal"><input type="password" name="pw"/></form>
      `;
      const result = service.sanitize(malicious);
      expect(result).not.toContain('<iframe');
      expect(result).not.toContain('<object');
      expect(result).not.toContain('<form');
      expect(result).not.toContain('<input');
    });
  });

  describe('Safe Content Preservation', () => {
    it('preserves clean structural HTML and valid inline styles', () => {
      const clean = `
        <div style="padding: 20px; color: #0284c7;">
          <h1>Welcome to Wyxan</h1>
          <p>This is a safe internal page.</p>
          <a href="coral-reef.zz">Go to Reef</a>
        </div>
      `;
      const result = service.sanitize(clean);
      expect(result).toContain('<h1>Welcome to Wyxan</h1>');
      expect(result).toContain('color:#0284c7');
      expect(result).toContain('href="coral-reef.zz"');
    });
  });

  describe('Searchable Plain-Text Extraction', () => {
    it('extracts text without HTML tags for search indexing', () => {
      const html = '<h1>Oceanic Abyss</h1><p>Deep water <strong>creatures</strong> thrive.</p>';
      const text = service.extractSearchableText(html);
      expect(text).toBe('Oceanic Abyss Deep water creatures thrive.');
    });
  });
});
