import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CodeLab Online IDE - Fast C, C++, Python Compiler',
    short_name: 'CodeLab IDE',
    description: 'Fast online C/C++ compiler and cloud development environment with interactive terminal and live student lab monitoring.',
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
