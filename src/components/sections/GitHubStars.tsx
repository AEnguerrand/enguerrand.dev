import { ArrowUpRight, ChevronDown, Clock3, GitFork, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StarredRepository = {
  id: number;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  archived: boolean;
  fork: boolean;
  topics: string[];
  updated_at: string;
  starred_at: string | null;
};

type StarredGroup = {
  slug: string;
  name: string;
  description?: string;
  repos: StarredRepository[];
};

type StarredDataset = {
  username: string;
  generated_at: string;
  total_repos: number;
  groups: StarredGroup[];
};

type GitHubStarsProps = {
  dataset: StarredDataset | null;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RepoCard({ repo }: { repo: StarredRepository }) {
  return (
    <Card className="lift-card border-border/70 bg-background/70">
      <CardHeader className="space-y-2 p-4 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {repo.language && (
            <Badge
              variant="secondary"
              className="border border-border/70 bg-secondary/60 px-2 py-0.5 text-[10px] uppercase"
            >
              {repo.language}
            </Badge>
          )}
          {repo.archived && (
            <Badge variant="outline" className="border-border/70 bg-card/70 px-2 py-0.5 text-[10px]">
              Archived
            </Badge>
          )}
          {repo.fork && (
            <Badge variant="outline" className="border-border/70 bg-card/70 px-2 py-0.5 text-[10px]">
              Fork
            </Badge>
          )}
        </div>
        <CardTitle className="min-w-0 text-lg leading-tight sm:text-xl">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 items-start gap-1.5 text-foreground hover:text-primary"
          >
            <span className="min-w-0 break-all">{repo.full_name}</span>
            <ArrowUpRight className="h-4 w-4 shrink-0" />
          </a>
        </CardTitle>
        <CardDescription className="max-h-10 overflow-hidden text-xs leading-relaxed">
          {repo.description ?? "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-3 w-3" />
            {formatNumber(repo.stargazers_count)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitFork className="h-3 w-3" />
            {formatNumber(repo.forks_count)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3 w-3" />
            Updated {formatDate(repo.updated_at)}
          </span>
        </div>
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 2).map((topic) => (
              <span
                key={`${repo.id}-${topic}`}
                className="rounded-md border border-border/80 bg-secondary/50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GitHubStars({ dataset }: GitHubStarsProps) {
  if (!dataset) {
    return (
      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="text-2xl">Starred repositories are unavailable</CardTitle>
          <CardDescription>
            I couldn&apos;t load the stars data right now. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const nonEmptyGroups = dataset.groups.filter((group) => group.repos.length > 0);

  if (nonEmptyGroups.length === 0) {
    return (
      <Card className="border-border/70 bg-card/80">
        <CardHeader>
          <CardTitle className="text-2xl">No starred repositories yet</CardTitle>
          <CardDescription>There are no starred repositories to display yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {formatNumber(dataset.total_repos)} starred repositories, organized into topic lists.
        </p>
        <p className="text-xs text-muted-foreground">
          Last updated {formatDate(dataset.generated_at)}
        </p>
      </div>

      <section className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground">
          Jump to a list
        </p>
        <div className="flex flex-wrap gap-2">
          {nonEmptyGroups.map((group) => (
            <a
              key={`quick-${group.slug}`}
              href={`#list-${group.slug}`}
              className="inline-flex items-center gap-2 rounded-md border border-border/80 bg-secondary/50 px-3 py-1 text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-secondary/70"
            >
              <span>{group.name}</span>
              <span className="rounded-md border border-border/70 bg-card/80 px-2 py-0.5 text-[10px] text-muted-foreground">
                {formatNumber(group.repos.length)}
              </span>
            </a>
          ))}
        </div>
      </section>

      {nonEmptyGroups.map((group) => (
        <section key={group.slug} id={`list-${group.slug}`} className="scroll-mt-32">
          <details className="group overflow-hidden rounded-lg border border-border/70 bg-card/80 open:bg-card/80">
            <summary className="flex list-none cursor-pointer flex-wrap items-start justify-between gap-3 bg-card/80 p-4 transition-colors hover:bg-card/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-card/80 [&::-webkit-details-marker]:hidden">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                  <h2 className="text-xl sm:text-2xl">{group.name}</h2>
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
              </div>
              <span className="rounded-md border border-border/80 bg-secondary/60 px-3 py-1 text-xs font-semibold tracking-[0.08em] uppercase text-muted-foreground">
                {formatNumber(group.repos.length)} repos
              </span>
            </summary>

            <div className="border-t border-border/70 p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.repos.map((repo) => (
                  <RepoCard key={`${group.slug}-${repo.id}`} repo={repo} />
                ))}
              </div>
            </div>
          </details>
        </section>
      ))}
    </div>
  );
}
