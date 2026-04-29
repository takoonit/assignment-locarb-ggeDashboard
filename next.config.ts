import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mui/x-date-pickers", "@mui/material", "@mui/icons-material", "@mui/system"],
};

export default nextConfig;
