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
  metadataBase: new URL('https://app.restuvexo.shop'),
  title: {
    default: 'CodeLab Online IDE | Fast Online C, C++, Java & Python Compiler',
    template: '%s | CodeLab Online IDE',
  },
  description: 'CodeLab is an ultra-fast, secure online C compiler (GCC 13.3), C++ IDE, and Python sandbox. Features interactive terminal input for scanf/cin, zero-lag execution, test-case grading, and live student lab monitoring.',
  keywords: [
    'online c compiler',
    'c compiler online',
    'c online compiler with scanf',
    'run c program online',
    'gcc online compiler',
    'c++ online compiler',
    'python online compiler',
    'online ide',
    'cloud c compiler',
    'fast online c compiler',
    'interactive c terminal online',
    'centralized programming lab',
    'computer science lab system',
    'brainware university coding lab',
    'code runner online',
    'free online coding environment'
  ],
  authors: [{ name: 'Aftab Sk', url: 'https://github.com/theaftabsk' }],
  creator: 'Aftab Sk',
  publisher: 'CodeLab IDE',
  applicationName: 'CodeLab Online IDE',
  generator: 'Next.js',
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: 'https://app.restuvexo.shop',
    languages: {
      'en-US': 'https://app.restuvexo.shop',
      'bn-BD': 'https://app.restuvexo.shop',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://app.restuvexo.shop',
    title: 'CodeLab Online IDE | Fast Online C, C++, Java & Python Compiler',
    description: 'Execute C (GCC 13), C++, and Python code in sub-50ms with interactive terminal input for scanf, real-time lab monitoring, and auto test grading.',
    siteName: 'CodeLab IDE',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeLab Online IDE - Fast Online C Compiler',
    description: 'Compile and run C, C++, and Python programs instantly online with interactive scanf support and live student lab monitoring.',
    creator: '@theaftabsk',
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
  category: 'Developer Tools & Education',
  classification: 'Online Compiler, Educational Technology, Cloud IDE',
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
        '@id': 'https://app.restuvexo.shop/#webapp',
        'name': 'CodeLab Online IDE',
        'url': 'https://app.restuvexo.shop',
        'description': 'High-performance online C, C++, Java, and Python compiler with real-time interactive terminal input for scanf and centralized classroom laboratory monitoring.',
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
        'author': {
          '@type': 'Person',
          'name': 'Aftab Sk',
          'url': 'https://github.com/theaftabsk',
        },
      },
      {
        '@type': 'EducationalOrganization',
        '@id': 'https://app.restuvexo.shop/#organization',
        'name': 'CodeLab Digital Programming Lab',
        'url': 'https://app.restuvexo.shop',
        'description': 'Centralized institutional programming laboratory platform for universities and computer science courses.',
      },
    ],
  };

  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable} ${firaCode.variable}`}>
      <head>
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://app.restuvexo.shop" />
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
