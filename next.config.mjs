/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No wildcard remote image hosts: the UI uses plain <img>, not the next/image
  // optimizer, so there's no need to open the Image Optimizer to arbitrary hosts.
  // Add specific { protocol, hostname } entries here if you switch to next/image
  // with real product photos.
};

export default nextConfig;
