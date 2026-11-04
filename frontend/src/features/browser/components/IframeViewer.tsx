'use client';

import React, { useEffect, useRef, useState } from 'react';
import { NavigationDestination } from '@/types/navigation';
import { Loader2 } from 'lucide-react';

interface IframeViewerProps {
  html: string;
  address: string;
  scrollPosition: number;
  onNavigate: (destination: NavigationDestination, currentScroll: number) => void;
}

export const IframeViewer: React.FC<IframeViewerProps> = ({
  html,
  address,
  scrollPosition,
  onNavigate,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Styled base template wrapped around sanitized HTML
  const styledDocument = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${address}</title>
        <style>
          *, *::before, *::after { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            line-height: 1.6;
          }
          a {
            color: #0284c7;
            text-decoration: underline;
            cursor: pointer;
          }
          a:hover {
            color: #0369a1;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  useEffect(() => {
    setIsReady(false);
  }, [html, address]);

  const handleIframeLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;

      // 1. Restore scroll position on load
      if (typeof scrollPosition === 'number' && scrollPosition > 0) {
        win.scrollTo(0, scrollPosition);
      }

      // 2. Intercept internal .zz link clicks
      const links = doc.querySelectorAll('a');
      links.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const href = link.getAttribute('href');
          if (href) {
            const currentScroll = win.scrollY || 0;
            onNavigate({ type: 'site', address: href }, currentScroll);
          }
        });
      });

      setIsReady(true);
    } catch {
      // In case same-origin boundary restrictions prevent access
      setIsReady(true);
    }
  };

  return (
    <div className="relative flex-1 w-full h-full bg-slate-950 flex flex-col overflow-hidden">
      {!isReady && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}
      <iframe
        ref={iframeRef}
        title={`View: ${address}`}
        srcDoc={styledDocument}
        onLoad={handleIframeLoad}
        // Sandboxed without allow-scripts or allow-top-navigation for maximum defense-in-depth isolation
        sandbox="allow-same-origin"
        className="w-full h-full border-none bg-white select-text"
      />
    </div>
  );
};
