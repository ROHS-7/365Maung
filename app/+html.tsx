import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/** Web-only root HTML. Forces light color-scheme so dark-mode browsers keep dark text. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#ffffff" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html:
              'html,body,#root{height:100%;height:100dvh;max-height:100dvh}' +
              'html,body{background:#ffffff;color:#1A2E22;color-scheme:light!important}' +
              '.burma-announce-track{flex:1;min-width:0;overflow:hidden;height:18px}' +
              '@keyframes burma-announce-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
              '.burma-announce-row{display:flex;flex-direction:row;flex-wrap:nowrap;width:max-content;animation-name:burma-announce-marquee;animation-timing-function:linear;animation-iteration-count:infinite}' +
              '.burma-announce-text{flex-shrink:0;white-space:nowrap;padding-right:48px;font-size:14px;font-weight:500;line-height:18px;color:#1A2E22}',
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
