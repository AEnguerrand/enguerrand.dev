import * as React from "react";
import { ArrowUpRight, CalendarDays, Mic2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { topicHref, topicTitle } from "@/lib/topics";

type Talk = {
  id: string;
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
    <section className="mt-2 space-y-6 sm:mt-4">
      <Card className="lift-card border-border/70 bg-card/90 shadow-[0_16px_42px_hsl(var(--foreground)/0.06)]">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="w-fit border border-border/70 bg-secondary/65">
              Speaking
            </Badge>
            <CardTitle className="text-3xl sm:text-4xl">Latest talks</CardTitle>
            <CardDescription className="max-w-2xl text-base">
              Recent sessions from KubeCon, AWS Summit, and community meetups on cloud security, SRE, and platform engineering.
            </CardDescription>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <a href="/talks">
              View all talks <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        </CardHeader>
      </Card>

      {talks.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {talks.map((talk) => (
          <Card
            key={talk.id}
            className="lift-card flex h-full flex-col border-border/70 bg-card/90 shadow-[0_12px_32px_hsl(var(--foreground)/0.05)]"
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(talk.data.date)}
              </div>
              <CardTitle className="text-xl leading-snug">{talk.data.title}</CardTitle>
              {talk.data.event && <p className="text-sm text-muted-foreground">{talk.data.event}</p>}
            </CardHeader>
            <CardContent className="mt-auto space-y-4">
              {(talk.data.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(talk.data.tags ?? []).slice(0, 3).map((tag) => (
                    <a
                      key={`${talk.id}-${tag}`}
                      href={topicHref(tag)}
                      className="rounded-full border border-border/70 bg-secondary/60 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {topicTitle(tag)}
                    </a>
                  ))}
                </div>
              )}
              <Button asChild className="w-full gap-2">
                <a href={`/talks/${talk.id}`}>
                  Read details <Mic2 className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </section>
  );
}
