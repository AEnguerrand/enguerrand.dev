import {
  BookmarkSimple,
  Brain,
  Cloud,
  Code,
  Cube,
  GitBranch,
  Package,
  PlugsConnected,
  ShieldCheck,
} from "@phosphor-icons/react";

const topicIcons = {
  security: ShieldCheck,
  kubernetes: Cube,
  "supply-chain-security": Package,
  "ci-cd": GitBranch,
  mcp: PlugsConnected,
  aws: Cloud,
  dev: Code,
  "ai-ml": Brain,
};

export function TopicIcon({ slug, className = "h-4 w-4" }: { slug: string; className?: string }) {
  const Icon = topicIcons[slug as keyof typeof topicIcons] ?? BookmarkSimple;
  return <Icon aria-hidden="true" className={className} />;
}
