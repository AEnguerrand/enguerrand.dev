import { ArrowUpRight, Clock, GitFork, Star } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { TopicIcon } from "@/components/TopicIcon";
import { type StarredRepository, type StarredDataset, starsListHref, starsListName } from "@/lib/stars";

const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatDate = (value: string) => new Date(value).toLocaleDateString("en-US", {year:"numeric",month:"short",day:"numeric",timeZone:"UTC"});

export function RepoCard({ repo }: { repo: StarredRepository }) {
  return (
    <article className="site-list-row flex h-full flex-col py-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {repo.language && (
            <Badge
              variant="secondary"
              className="border border-border/70 bg-secondary/55 px-2 py-0.5 text-xs"
            >
              {repo.language}
            </Badge>
          )}
          {repo.archived && (
            <Badge variant="outline" className="border-border/70 bg-card/70 px-2 py-0.5 text-xs">
              Archived
            </Badge>
          )}
          {repo.fork && (
            <Badge variant="outline" className="border-border/70 bg-card/70 px-2 py-0.5 text-xs">
              Fork
            </Badge>
          )}
        </div>
        <h3 className="min-w-0 text-lg font-semibold leading-tight sm:text-xl">
          <a
            href={repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="site-link min-w-0 items-start text-lg text-foreground sm:text-xl"
          >
            <span className="min-w-0 break-all">{repo.full_name}</span>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
          </a>
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {repo.description ?? "No description provided."}
        </p>
      </header>
      <div className="mt-auto space-y-2 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Star aria-hidden="true" className="h-3 w-3" />
            <span className="sr-only">Stars: </span>
            {formatNumber(repo.stargazers_count)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GitFork aria-hidden="true" className="h-3 w-3" />
            <span className="sr-only">Forks: </span>
            {formatNumber(repo.forks_count)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" className="h-3 w-3" />
            Updated {formatDate(repo.updated_at)}
          </span>
        </div>
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.slice(0, 2).map((topic) => (
              <span
                key={`${repo.id}-${topic}`}
                className="rounded-md border border-border/80 bg-secondary/50 px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function GitHubStars({dataset}: {dataset: StarredDataset | null}) {
  if (!dataset) return <p>Repository data is unavailable. <a href="https://github.com/AEnguerrand?tab=stars" className="site-link">Browse my starred repositories</a></p>;
  const groups = dataset.groups.filter(group => group.repos.length > 0);
  return (
    <section className="site-section-divider" aria-labelledby="stars-topics-heading">
      <h2 id="stars-topics-heading" className="text-2xl">Topics</h2>
      {groups.length ? <ul className="site-list grid gap-x-6 sm:grid-cols-2">{groups.map(group =>
        <li key={group.slug} id={`list-${group.slug}`} className="site-list-row scroll-mt-40">
          <a href={starsListHref(group.slug)} className="site-link w-full justify-between py-3 font-medium">
            <span className="flex min-w-0 items-center gap-2"><TopicIcon slug={group.slug} /><span>{starsListName(group.name)}</span></span><span className="shrink-0 text-xs tabular-nums text-muted-foreground">{group.repos.length} →</span>
          </a>
        </li>
      )}</ul> : <p>No starred repositories yet.</p>}
    </section>
  );
}
