import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import StructuredData from "@/components/StructuredData";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.mcast.fun"),
  title: {
    default: "MCast – YouTube Live Status Plugin for Minecraft",
    template: "%s | MCast",
  },
  description:
    "Discover MCast, a Minecraft plugin that connects YouTube streamers with their Minecraft servers. Show live streaming status, link YouTube channels, and make your SMP more streamer-friendly.",
  keywords: [
    "Minecraft YouTube plugin",
    "Minecraft streaming plugin",
    "YouTube live status Minecraft",
    "Minecraft streamer plugin",
    "Minecraft SMP streaming",
    "MCast",
  ],
  alternates: {
    canonical: "https://www.mcast.fun",
  },
  openGraph: {
    title: "MCast – YouTube Live Status Plugin for Minecraft",
    description:
      "Discover MCast, a Minecraft plugin that connects YouTube streamers with their Minecraft servers. Show live streaming status and make your SMP more streamer-friendly.",
    type: "website",
    url: "https://www.mcast.fun",
    siteName: "MCast",
  },
  twitter: {
    card: "summary",
    title: "MCast – YouTube Live Status Plugin for Minecraft",
    description:
      "A Minecraft plugin that shows YouTube live streaming status in-game. Connect your channel and let your community know when you're live.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <StructuredData />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // 1. Filter hydration mismatch errors and warnings caused by browser extensions (e.g. Bitwarden bis_skin_checked)
                var origError = console.error;
                console.error = function() {
                  for (var i = 0; i < arguments.length; i++) {
                    var arg = arguments[i];
                    if (typeof arg === 'string' && (arg.indexOf('bis_skin_checked') !== -1 || (arg.indexOf('hydrat') !== -1 && (arg.indexOf('extension') !== -1 || arg.indexOf('skin') !== -1)))) {
                      return;
                    }
                  }
                  origError.apply(console, arguments);
                };

                // 2. Automatically strip bis_skin_checked attributes injected by extensions into the DOM
                try {
                  var clean = function(el) {
                    if (el && el.removeAttribute) el.removeAttribute('bis_skin_checked');
                  };
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        clean(m.target);
                      } else if (m.type === 'childList') {
                        for (var j = 0; j < m.addedNodes.length; j++) {
                          var node = m.addedNodes[j];
                          if (node.nodeType === 1) {
                            clean(node);
                            if (node.querySelectorAll) {
                              var els = node.querySelectorAll('[bis_skin_checked]');
                              for (var k = 0; k < els.length; k++) clean(els[k]);
                            }
                          }
                        }
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    attributeFilter: ['bis_skin_checked'],
                    childList: true,
                    subtree: true,
                  });
                } catch (e) {}

                // 3. Catch unhandled extension script runtime errors
                window.addEventListener('error', function(e) {
                  if (e.filename && (e.filename.indexOf('chrome-extension://') !== -1 || e.filename.indexOf('moz-extension://') !== -1)) {
                    e.stopImmediatePropagation();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  var stack = (e.reason && e.reason.stack) || '';
                  if (stack.indexOf('chrome-extension://') !== -1 || stack.indexOf('moz-extension://') !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-bg-primary text-text-primary`}
        suppressHydrationWarning
      >
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
