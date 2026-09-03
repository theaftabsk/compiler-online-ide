import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kaspro Online Compiler - Fast C, C++, Python IDE (ITVEXO)',
    short_name: 'Kaspro Compiler',
    description: 'Fastest online C/C++ compiler and cloud development environment by ITVEXO.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1e1e1e',
    theme_color: '#0078d4',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
