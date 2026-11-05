# Wyxan Browser: Security Model & HTML Containment

User-published content is untrusted by default. The system enforces strict defense-in-depth:

## Pipeline Controls

1. **Input Address Validation:**
   - Strict canonical format: `^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*\.zz$`.
   - External schemes (http/https/ftp) and arbitrary TLDs are rejected.

2. **HTML Sanitization (`HtmlSanitizerService`):**
   - Strips `<script>`, `<style>`, `<iframe>`, `<embed>`, `<object>`, `<form>`, `<input>`.
   - Discards all inline event handlers (`onload`, `onclick`, `onerror`).
   - Discards dangerous URL schemes (`javascript:`, `data:`, `vbscript:`).
   - Sanitizes inline style properties against an allowlist of safe CSS directives.

3. **Rendering Isolation:**
   - Rendered strictly inside `<iframe sandbox="allow-same-origin">`.
   - Explicitly omits `allow-scripts` and `allow-top-navigation`, preventing script execution or parent framing takeovers.

4. **Internal Link Routing:**
   - Link clicks inside the iframe are intercepted by event listeners and routed back through the backend navigation API.

