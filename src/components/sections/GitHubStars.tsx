import { ArrowUpRight, Clock3, GitFork, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type StarredRepository, type StarredDataset, starsListHref, starsListName } from "@/lib/stars";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatDate = (value: string) => new Date(value).toLocaleDateString("en-US", {year:"numeric",month:"short",day:"numeric",timeZone:"UTC"});

export function RepoCard({ repo }: { repo: StarredRepository }) {
  return (
    <Card className="lift-card border-border/70 bg-card/90 shadow-[0_10px_26px_hsl(var(--foreground)/0.05)]">
      <CardHeader className="space-y-2 p-4 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {repo.language && (
            <Badge
              variant="secondary"
              className="border border-border/70 bg-secondary/55 px-2 py-0.5 text-[10px]"
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
        <CardDescription className="text-xs leading-relaxed">
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
                className="rounded-full border border-border/80 bg-secondary/50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] uppercase text-muted-foreground"
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

export function GitHubStars({dataset}: {dataset: StarredDataset | null}) {
  if (!dataset) return <p>Repository data is unavailable. <a href="https://github.com/AEnguerrand?tab=stars" className="text-primary underline">Browse GitHub Stars</a></p>;
  const groups = dataset.groups.filter(group => group.repos.length > 0);
  return (
    <Card className="border-border/70 bg-card/90 shadow-[0_14px_36px_hsl(var(--foreground)/0.05)]">
      <CardHeader className="pb-3"><CardTitle as="h2" className="text-2xl">Browse lists</CardTitle></CardHeader>
      <CardContent>
        {groups.length ? <ul className="grid gap-x-6 sm:grid-cols-2">{groups.map(group =>
          <li key={group.slug} id={`list-${group.slug}`} className="scroll-mt-40 border-b border-border/60">
            <a href={starsListHref(group.slug)} className="flex items-center justify-between gap-3 py-3 text-sm font-medium hover:text-primary">
              <span>{starsListName(group.name)}</span><span className="shrink-0 text-xs text-muted-foreground">{group.repos.length} →</span>
            </a>
          </li>
        )}</ul> : <p>No starred repositories yet.</p>}
      </CardContent>
    </Card>
  );
}
