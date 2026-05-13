import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Turns — 보드게임 매칭",
  description: "Love Letter 온라인 매칭 플랫폼",
};

// Run before React mounts so we never flash the wrong theme.
const themeInitScript = `
try {
  var t = localStorage.getItem('turns_theme');
  if (t !== 'tarot' && t !== 'pixel') t = 'pixel';
  document.documentElement.setAttribute('data-theme', t);
} catch (e) {
  document.documentElement.setAttribute('data-theme', 'pixel');
}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-theme="pixel">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
