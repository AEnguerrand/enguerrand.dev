import * as React from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Talk = {
  slug: string;
  data: {
    title: string;
    date: string;
    event?: string;
    tags?: string[];
  };
};

type TalksSpotlightProps = {
  talks: Talk[];
};

export function TalksSpotlight({ talks }: TalksSpotlightProps) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <section className="border-b border-border/80 py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="space-y-5">
          <p className="section-label">Latest talks</p>
          <h2 className="text-4xl leading-tight sm:text-5xl">Field notes from security and platform work.</h2>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Recent sessions from KubeCon, AWS Summit, and community meetups on cloud security, SRE, and platform engineering.
          </p>
          <Button asChild variant="outline" className="gap-2">
            <a href="/talks">
              View all talks <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

      {talks.length > 0 && (
        <div className="divide-y divide-border/80 border-y border-border/80">
          {talks.map((talk) => (
            <article
              key={talk.slug}
              className="grid gap-4 py-6 transition-colors hover:bg-secondary/35 sm:grid-cols-[1fr_auto]"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground" style={{ letterSpacing: "0.1em" }}>
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(talk.data.date)}
                </div>
                <h3 className="text-xl font-semibold leading-snug">
                  <a href={`/talks/${talk.slug}`} className="hover:text-primary">
                    {talk.data.title}
                  </a>
                </h3>
                {talk.data.event && <p className="text-sm text-muted-foreground">{talk.data.event}</p>}
              </div>
              <div className="flex flex-wrap items-start gap-2 sm:max-w-52 sm:justify-end">
                {(talk.data.tags ?? []).slice(0, 3).map((tag) => (
                  <Badge key={`${talk.slug}-${tag}`} variant="secondary" className="rounded-md border border-border/70 bg-secondary/70 text-[10px] uppercase">
                    {tag}
                  </Badge>
                ))}
                <a
                  href={`/talks/${talk.slug}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary"
                >
                  Details <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
