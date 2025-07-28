/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/process', // Путь, который будет использоваться в коде
        destination: 'http://kb-api.konstruktorpd.ru:16001/process', // Реальный URL API
      },
    ];
  },
};

export default nextConfig;