/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bhyrxyzokssibgeznojo.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
