import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

const nextConfig = (phase: string): NextConfig => {
  return {
    /* config options here */
    reactCompiler: true,
    output: "standalone",

    env: {
      NEXT_PHASE: phase,
    },

    ...(phase === PHASE_PRODUCTION_BUILD ? {
      // build階段
    } : {}),
  }
};

export default nextConfig;
