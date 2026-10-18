import * as React from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Talk = {
  id: string;
  data: {
    title: string;
    displayTitle?: string;
    seoTitle?: string;
    summary?: string;
    resources?: { label: string; url: string }[];
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
      timeZone: "UTC",
    });

  return (
    <section id="selected-talks" aria-labelledby="talks-title" className="mt-2 scroll-mt-52 space-y-4 sm:mt-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h2 id="talks-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">Selected talks</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">Recordings, slides, and practical examples.</p>
        </div>
        <a href="/talks/" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">All talks <ArrowUpRight className="h-4 w-4" /></a>
      </div>

      {talks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {talks.map((talk) => (
          <Card
            key={talk.id}
            className="lift-card flex h-full flex-col border-border/70 bg-card/90 shadow-[0_12px_32px_hsl(var(--foreground)/0.05)]"
          >
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                <time dateTime={talk.data.date}>{formatDate(talk.data.date)}</time>
              </div>
              <CardTitle className="text-xl leading-snug"><a href={`/talks/${talk.id}/`} className="hover:text-primary">{talk.data.displayTitle ?? talk.data.seoTitle ?? talk.data.title}</a></CardTitle>
              {talk.data.event && <p className="text-sm text-muted-foreground">{talk.data.event}</p>}
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              {talk.data.summary && <p className="text-sm leading-relaxed text-muted-foreground">{talk.data.summary}</p>}
              <div className="mt-auto flex flex-wrap gap-x-4">
                {(talk.data.resources ?? []).filter((r) => /video|recording|slide|lab/i.test(r.label)).map((resource) => (
                  <a key={resource.url} href={resource.url} aria-label={`${resource.label}: ${talk.data.displayTitle ?? talk.data.title}`} className="inline-flex min-h-10 items-center text-sm font-medium text-primary hover:underline">{resource.label}</a>
                ))}
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </section>
  );
}
