import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 프로젝트 CLAUDE.md는 팀이 직접 관리하는 문서라, Next.js가 여기에
  // agent-rules 블록을 자동으로 덧붙이지 않도록 끈다.
  agentRules: false,
};

export default nextConfig;
