import data from "../../public/data/starred-groups.json";

export type StarredRepository = {
  id: number; full_name: string; html_url: string; description: string | null;
  stargazers_count: number; forks_count: number; language: string | null;
  archived: boolean; fork: boolean; topics: string[]; updated_at: string; starred_at: string | null;
};
export type StarredGroup = {slug: string; name: string; description?: string; repos: StarredRepository[]};
export type StarredDataset = {username: string; generated_at: string; total_repos: number; groups: StarredGroup[]};
export const starsDataset: StarredDataset = data;
export const starsGroups = starsDataset.groups.filter(group => group.repos.length > 0);
export const starsPageSize = 36;
const topicIcons: Record<string, string> = {
  data: "📊",
  go: "🐹",
  kubernetes: "☸️",
  others: "🧭",
  rust: "🦀",
  aws: "☁️",
  "aws-control-tower-orga": "🏢",
  "see-on-conference": "🎤",
  "home-automation": "🏠",
  ledger: "👀",
  "ai-ml": "💥",
  safe: "💰",
  dev: "💻",
  monitoring: "📈",
  "infra-as-code": "📦",
  security: "🔒",
  architecture: "🗺️",
  "ci-cd": "🚀",
  "supply-chain-security": "🚚",
  mcp: "🤖",
  personal: "🧪",
  "to-classify": "🗂️",
};

export const starsListName = (name: string) => name
  .replace(/componements/gi, "components")
  .replace(/^[^A-Za-z0-9]+/u, "")
  .trim();
export const starsTopicIcon = (slug: string) => topicIcons[slug] ?? "•";
export const starsTopicName = (group: Pick<StarredGroup, "slug" | "name">) =>
  `${starsTopicIcon(group.slug)} ${starsListName(group.name)}`;
export function starsListHref(slug: string, page = 1): string {
  return `/github-stars/${encodeURIComponent(slug)}/${page === 1 ? "" : `${page}/`}`;
}
export const starsDate = (value: string) => new Date(value).toLocaleDateString("en-US", {year: "numeric",month: "short",day: "numeric",timeZone: "UTC"});
