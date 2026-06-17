/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;

