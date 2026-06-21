import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API 路由超时设置
  experimental: {
    // 增加 server actions 的超时时间
  },
};

export default nextConfig;
