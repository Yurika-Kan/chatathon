/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects() {
    return [
      {
        source: "/",
        destination: "/campco.html",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
