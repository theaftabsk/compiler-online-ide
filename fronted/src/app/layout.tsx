import type { Metadata, Viewport } from 'next';
import { Inter, Outfit, Fira_Code } from 'next/font/google';
import { TeacherAuthProvider } from '@/context/TeacherAuthContext';
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
    default: 'Online C Compiler - Run C Programs Online Free (GCC 13) | Kaspro',
    template: '%s | Online C Compiler - Kaspro',
  },
  description: 'Fastest Online C Compiler & C IDE by ITVEXO. Write, compile, and run C code online using GCC 13.3 with interactive terminal input for scanf in 30ms. Free, zero setup.',
  keywords: [
    'online compiler',
    'online c compiler',
    'c compiler online',
    'free online compiler',
    'c online compiler with scanf',
    'online c compiler with input',
    'run c program online',
    'gcc online compiler',
    'best online c compiler',
    'fastest online c compiler',
    'c programming online',
    'online c ide',
    'gcc 13 online compiler',
    'online code editor',
    'online compiler and debugger',
    'kaspro online compiler',
    'kaspro compiler',
    'itvexo online compiler',
    'itvexo',
    'c++ online compiler',
    'python online compiler',
    'interactive c terminal',
    'online code editor for c',
    'c compiler for students',
    'free online coding environment'
  ],
  authors: [{ name: 'ITVEXO', url: 'https://kaspro.online' }],
  creator: 'ITVEXO',
  publisher: 'ITVEXO',
  applicationName: 'Kaspro Online C Compiler',
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
    title: 'Online C Compiler - Run C Program Online (GCC 13) | Kaspro by ITVEXO',
    description: 'Compile and run C code online in 30ms with real GCC 13.3. Interactive terminal for scanf, automated test grading, and live student lab monitoring. An ITVEXO product.',
    siteName: 'Kaspro Online Compiler - by ITVEXO',
    locale: 'en_US',
    images: [
      {
        url: 'https://kaspro.online/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Online C Compiler - Kaspro by ITVEXO',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online C Compiler - Run C Code Online (GCC 13) | Kaspro by ITVEXO',
    description: 'Free, ultra-fast online C compiler with interactive terminal input for scanf. Powered by ITVEXO.',
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
        'name': 'Kaspro Online C Compiler',
        'url': 'https://kaspro.online',
        'description': 'The world’s fastest online C compiler, C++ IDE, and Python development platform by ITVEXO. Features real GCC 13.3, interactive terminal input for scanf, sub-50ms execution speed, and live educational lab monitoring.',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'All (Web Browser, Chrome, Firefox, Safari, Edge)',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'ratingCount': '14280',
          'bestRating': '5',
          'worstRating': '1',
        },
        'featureList': [
          'Ultra-fast native GCC 13.3 compilation in 30 milliseconds',
          'Interactive STDIN terminal for scanf, cin, and input()',
          'Support for C (GCC 13), C++ (G++ 13), Java 21, and Python 3.12',
          'Real-time student code inspection and classroom laboratory monitoring',
          'Automated hidden test case evaluation and scoring',
          'Linux sandbox isolation with CPU and memory limits',
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
        '@type': 'WebSite',
        '@id': 'https://kaspro.online/#website',
        'url': 'https://kaspro.online',
        'name': 'Kaspro Online Compiler - by ITVEXO',
        'description': 'Run C programs online with real GCC 13.3 and interactive scanf input.',
        'publisher': {
          '@type': 'Organization',
          'name': 'ITVEXO',
          'url': 'https://kaspro.online',
          'logo': 'https://kaspro.online/icon',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://kaspro.online/#organization',
        'name': 'ITVEXO',
        'url': 'https://kaspro.online',
        'logo': 'https://kaspro.online/icon',
        'description': 'ITVEXO - Innovative developer tools, intelligent learning platforms, and high-performance cloud software.',
      },
      {
        '@type': 'HowTo',
        '@id': 'https://kaspro.online/#howto',
        'name': 'How to Run a C Program Online with scanf in Kaspro',
        'description': 'Step-by-step guide to writing, compiling, and running C code with user input online using Kaspro Online Compiler.',
        'step': [
          {
            '@type': 'HowToStep',
            'position': 1,
            'name': 'Write your C Code',
            'text': 'Enter your C code into the editor. Include standard libraries like #include <stdio.h> and write your scanf() input statements.',
          },
          {
            '@type': 'HowToStep',
            'position': 2,
            'name': 'Click Run',
            'text': 'Click the green ▶ Run button or press Ctrl+Enter to initiate GCC 13.3 compilation.',
          },
          {
            '@type': 'HowToStep',
            'position': 3,
            'name': 'Enter Input in Terminal',
            'text': 'When the terminal asks for input, type your input numbers or strings (separated by spaces if multiple) and press Enter.',
          },
          {
            '@type': 'HowToStep',
            'position': 4,
            'name': 'View Instant Output',
            'text': 'See your compiled execution results in under 50 milliseconds directly in the interactive terminal.',
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://kaspro.online/#faq',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'What is the best online C compiler?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Kaspro Online Compiler by ITVEXO is the premier online C compiler. It provides genuine GCC 13.3 compilation, instantaneous sub-50ms execution speed, full scanf interactive terminal support, and a complete VS Code editing experience.',
            },
          },
          {
            '@type': 'Question',
            'name': 'How to use scanf in Kaspro Online C Compiler?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Whenever your C code contains scanf(), clicking Run pauses execution in the terminal, displaying an interactive prompt. Simply type your numbers or strings (e.g. 101 John 20) and press Enter.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Which C compiler version does Kaspro use?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Kaspro uses the official GCC 13.3.0 compiler on Ubuntu Linux with -O2 optimizations and sandboxed resource limits.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Is Kaspro Online Compiler free to use?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes! Kaspro Online Compiler is an official ITVEXO product that is 100% free for students, educators, and software engineers worldwide.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Can I enter multiple inputs for scanf in C?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, you can enter multiple inputs separated by spaces (e.g. 80 90 75 85 95) or newlines, and Kaspro will feed each scanf() call sequentially without timing out.',
            },
          },
          {
            '@type': 'Question',
            'name': 'Does Kaspro support other languages besides C?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Yes, Kaspro also supports C++ (G++ 13), Java (JDK 21), and Python 3.12 with full interactive terminal execution.',
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
        <TeacherAuthProvider>
          {children}
        </TeacherAuthProvider>
      </body>
    </html>
  );
}
