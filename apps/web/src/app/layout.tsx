import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MunderDifflin // OfficeDev — 2D Multi-Agent Virtual Engineering Office',
  description:
    'Production-ready autonomous multi-agent AI software engineering platform visualized inside an interactive 2D pixel-art virtual office with real-time terminals, Kanban, and code sandbox.',
  keywords: [
    'multi-agent',
    'AI agents',
    'virtual office',
    'pixel art',
    'software engineering',
    'xterm.js',
    'autonomous coding',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full w-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏢</text></svg>" />
      </head>
      <body className="h-screen w-screen overflow-hidden bg-[#1b201a] text-[#f4f1de] antialiased selection:bg-[#52796f]/40 selection:text-[#f4f1ea]">
        {children}
      </body>
    </html>
  );
}
