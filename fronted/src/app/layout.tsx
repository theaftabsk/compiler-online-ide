import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  themeColor: '#0078d4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kaspro.online'),
  title: {
    default: 'Kaspro Online Compiler | #1 Online C Compiler with scanf | by ITVEXO',
    template: '%s | Kaspro Online Compiler - ITVEXO',
  },
  description: 'Kaspro Online Compiler is the fastest, ultra-secure online C compiler (GCC 13.3), C++ IDE, and Python cloud sandbox by ITVEXO. Features interactive terminal input for scanf and cin, sub-50ms execution speed, automated grading, and live student lab monitoring.',
  keywords: [
    'online c compiler',
    'c compiler online',
    'kaspro online compiler',
    'kaspro compiler',
    'kaspro online ide',
    'c online compiler with scanf',
    'online c compiler with input',
    'fastest online c compiler',
    'best c compiler online',
    'run c program online',
    'gcc online compiler',
    'gcc 13 online compiler',
    'c++ online compiler',
    'python online compiler',
    'online ide',
    'cloud c compiler',
    'itvexo online compiler',
    'itvexo compiler',
    'itvexo produt',
    'itvexo',
    'interactive c terminal online',
    'centralized programming lab',
    'computer science lab system',
    'free online coding environment',
    'code runner online'
  ],
  authors: [{ name: 'ITVEXO', url: 'https://kaspro.online' }],
  creator: 'ITVEXO',
  publisher: 'ITVEXO',
  applicationName: 'Kaspro Online Compiler',
  generator: 'Next.js',
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: 'https://kaspro.online',
    languages: {
      'en-US': 'https://kaspro.online',
      'bn-BD': 'https://kaspro.online',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://kaspro.online',
    title: 'Kaspro Online Compiler | #1 Fast Online C Compiler by ITVEXO',
    description: 'Execute C (GCC 13), C++, and Python code in 30ms. Supports interactive terminal input for scanf, real-time classroom lab monitoring, and instant output.',
    siteName: 'Kaspro Online Compiler - by ITVEXO',
    locale: 'en_US',
    images: [
      {
        url: 'https://kaspro.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kaspro Online Compiler - ITVEXO Product',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kaspro Online Compiler - #1 Online C Compiler with scanf (ITVEXO)',
    description: 'Ultra-fast online C, C++, and Python compiler with interactive terminal input for scanf. An official ITVEXO Product.',
    creator: '@itvexo',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Developer Tools & Online Compiler',
  classification: 'Online Compiler, Educational Technology, Cloud IDE, Developer Tools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': 'https://kaspro.online/#webapp',
        'name': 'Kaspro Online Compiler',
        'url': 'https://kaspro.online',
        'description': 'The fastest online C compiler, C++ IDE, and Python coding platform by ITVEXO. Features interactive terminal input for scanf, sub-50ms execution speed, and live educational lab monitoring.',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
        },
        'featureList': [
          'Ultra-fast native GCC 13.3 compilation (sub-50ms)',
          'Interactive STDIN terminal for scanf, cin, and input()',
          'Multiple programming languages: C, C++, Java, Python',
          'Real-time student code inspection and lab monitoring',
          'Automated test case grading and evaluation',
          'Cloud-isolated secure sandbox execution',
        ],
        'provider': {
          '@type': 'Organization',
          'name': 'ITVEXO',
          'url': 'https://kaspro.online',
        },
        'author': {
          '@type': 'Organization',
          'name': 'ITVEXO',
          'url': 'https://kaspro.online',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://kaspro.online/#organization',
        'name': 'ITVEXO',
        'url': 'https://kaspro.online',
        'logo': 'https://kaspro.online/icon',
        'description': 'ITVEXO - Creator of modern digital products, developer tools, and intelligent laboratory software including Kaspro Online Compiler.',
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://kaspro.online/#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is Kaspro Online Compiler?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Kaspro Online Compiler by ITVEXO is a next-generation cloud compiler that enables developers, students, and educators to write, compile, and execute C, C++, Java, and Python code instantly in a web browser without installing any software.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Does Kaspro Online Compiler support scanf and user input?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! Kaspro Online Compiler features a real-time interactive terminal that prompts users whenever scanf(), cin, or input() is used, supporting multiple sequential inputs without timing out.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Which C compiler does Kaspro use?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Kaspro uses the official GCC 13.3 compiler with -O2 optimizations and Linux sandbox security, providing lightning-fast execution in less than 50 milliseconds.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Is Kaspro Online Compiler free to use?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, Kaspro Online Compiler by ITVEXO is 100% free for students, teachers, and developers worldwide.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://kaspro.online/#breadcrumb',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://kaspro.online',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Online C Compiler',
            'item': 'https://kaspro.online',
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable} ${firaCode.variable}`}>
      <head>
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://kaspro.online" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body className="bg-[#1e1e1e] text-[#cccccc] antialiased selection:bg-[#0078d4] selection:text-white">
        {children}
      </body>
    </html>
  );
}
