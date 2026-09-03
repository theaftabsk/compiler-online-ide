import type { Metadata } from 'next';
import { Inter, Outfit, Fira_Code } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CodeLab Online IDE | Fast Online C, C++, Java & Python Compiler',
  description: 'CodeLab Online IDE is a powerful, secure, cloud-based programming laboratory and online compiler for C, C++, Java, and Python with live machine-wise lab monitoring and automated grading.',
  keywords: [
    'CodeLab Online IDE',
    'online c compiler',
    'c compiler online',
    'online ide',
    'gcc online compiler',
    'cloud c compiler',
    'c cpp java python online compiler'
  ],
  authors: [{ name: 'Aftab Sk' }],
  openGraph: {
    title: 'CodeLab Online IDE | Centralized Programming Lab & Cloud Compiler',
    description: 'Write, run, and debug C, C++, Java, and Python code online with VS Code-like experience and live university lab monitoring.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable} ${firaCode.variable}`}>
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-[#1e1e1e] text-[#cccccc] antialiased selection:bg-[#0078d4] selection:text-white">
        {children}
      </body>
    </html>
  );
}
