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

type StarredTopic = { label: string; description: string };

// Reader-facing text for the saved lists. Keep their source names and routes intact.
const topicDetails: Record<string, StarredTopic> = {
  "Data": {
    label: "Data and machine learning",
    description: "Python tools for data analysis and machine learning.",
  },
  "Go": {
    label: "Go tools",
    description: "Code checks and on-demand binaries for the Go language.",
  },
  "Kubernetes": {
    label: "Kubernetes",
    description: "Tools for container clusters, deployment, networking, and operations.",
  },
  "Others": {
    label: "Other tools",
    description: "A mixed list of tools and references outside the main topics.",
  },
  "Rust": {
    label: "Learning Rust",
    description: "Exercises for learning to read and write Rust code.",
  },
  "AWS": {
    label: "AWS cloud tools",
    description: "Amazon Web Services tools for applications, storage, and infrastructure.",
  },
  "AWS - Control Tower / Orga": {
    label: "AWS accounts and Control Tower",
    description: "Amazon Web Services account setup with Control Tower and Terraform.",
  },
  "See on conference": {
    label: "Conference finds",
    description: "Conference tools, demos, and references across several technical topics.",
  },
  "Home Automation": {
    label: "Home automation",
    description: "Home Assistant tools and Thread and Zigbee device connections.",
  },
  "Ledger": {
    label: "Ledger and related tools",
    description: "Ledger projects, Bitcoin tools, security research, and infrastructure.",
  },
  "AI / ML": {
    label: "AI and machine learning",
    description: "Artificial intelligence agents, model tools, and document recognition.",
  },
  "SAFE Collection of SAFE components": {
    label: "Safe wallet services",
    description: "Configuration, client access, events, and transaction services for Safe wallets.",
  },
  "Dev": {
    label: "Development tools",
    description: "Frameworks, application tools, and development utilities.",
  },
  "Monitoring": {
    label: "Monitoring and reliability",
    description: "Uptime checks, log analysis, project health, and failure testing.",
  },
  "Infra-As-Code": {
    label: "Infrastructure as code",
    description: "Terraform and OpenTofu tools to define, import, and check infrastructure.",
  },
  "Security": {
    label: "Security",
    description: "Cloud security, identity, defensive tools, and security research.",
  },
  "Architecture": {
    label: "Architecture diagrams",
    description: "Tools to draw system and cloud architecture diagrams from code.",
  },
  "CI/CD": {
    label: "Build and delivery (CI/CD)",
    description: "Continuous integration and delivery tools, including GitHub Actions.",
  },
  "Supply Chain Security": {
    label: "Software supply chain security",
    description: "Tools and research for signing, dependencies, builds, and provenance.",
  },
  "MCP": {
    label: "MCP and agent tools",
    description: "Model Context Protocol servers, agent skills, and workflow tools.",
  },
  "Personal": {
    label: "Personal tools",
    description: "Bookmarks for home projects, local tools, self-hosted services, and learning.",
  },
  "To Classify": {
    label: "Unsorted bookmarks",
    description: "Saved repositories that have not yet been assigned to a topic.",
  },
};
const topicKey = (name: string) => name.replace(/componements/gi, "components").replace(/^[^A-Za-z0-9]+/u, "").trim();
export const starsListName = (name: string) => topicDetails[topicKey(name)]?.label ?? topicKey(name);
export const starsListDescription = (group: Pick<StarredGroup, "name" | "description">) =>
  topicDetails[topicKey(group.name)]?.description ?? (group.description?.trim() || "Saved repositories in this topic.");
export function starsListHref(slug: string, page = 1): string {
  return `/github-stars/${encodeURIComponent(slug)}/${page === 1 ? "" : `${page}/`}`;
}
export const starsDate = (value: string) => new Date(value).toLocaleDateString("en-US", {year: "numeric",month: "short",day: "numeric",timeZone: "UTC"});
