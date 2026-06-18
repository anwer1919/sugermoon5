import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SugerMoon | Luxury Desserts',
  description: 'Premium e-commerce platform for luxury desserts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
