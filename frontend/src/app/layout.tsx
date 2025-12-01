import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shams - Your Bright AI Companion',
  description: 'Shams brings warmth and brightness to your conversations. Your cheerful AI voice companion. شمس',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
