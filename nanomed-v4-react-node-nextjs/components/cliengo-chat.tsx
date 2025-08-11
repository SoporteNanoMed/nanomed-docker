"use client"

import Script from "next/script"

export function CliengoChat() {
  return (
    <Script
      id="cliengo-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function () {
            var ldk = document.createElement('script');
            ldk.type = 'text/javascript';
            ldk.async = true;
            ldk.src = 'https://s.cliengo.com/weboptimizer/6823a4c81f12f60481ab6aa9/682c8cacd98cd5043dd775b6.js?platform=onboarding_modular';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ldk, s);
          })();
        `,
      }}
    />
  )
}
