import * as React from "react";
import { ArrowUpRight, Radar, Search, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

type WhyThisSiteProps = {
  talkCount: number;
};

const proofPoints = [
  {
    label: "Focus areas",
    value: "Cloud security, SRE, and platform engineering",
    detail: "Patterns and lessons grounded in production systems.",
    icon: ShieldCheck,
  },
  {
    label: "Talk archive",
    value: "Conference sessions and workshops",
    detail: "Slides, recordings, resources, and recurring themes in one place.",
    icon: Search,
  },
  {
    label: "Technical radar",
    value: "Curated tools and repositories",
    detail: "A practical view of the projects and ideas worth tracking.",
    icon: Radar,
  },
];

export function WhyThisSite({ talkCount }: WhyThisSiteProps) {
  return (
    <section className="border-b border-border/80 py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.55fr] lg:gap-12">
        <div className="space-y-4">
          <p className="section-label">Why this site</p>
          <h2 className="text-4xl leading-tight sm:text-5xl">
            Practical notes, with the evidence close by.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            A working collection of what I am learning, presenting, and using to build secure,
            reliable platforms.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border/80 md:grid-cols-3">
          {proofPoints.map((point, index) => {
            const Icon = point.icon;
            const detail =
              index === 1 && talkCount > 0
                ? `${talkCount} talks, with slides, recordings, resources, and recurring themes.`
                : point.detail;

            return (
              <article key={point.label} className="space-y-5 bg-background p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">0{index + 1}</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-primary" style={{ letterSpacing: "0.1em" }}>
                    {point.label}
                  </p>
                  <h3 className="text-lg font-semibold leading-snug">{point.value}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{detail}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5 rounded-lg border border-primary/25 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">Start here if you are new</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Search the archive by topic, technology, or talk and jump straight to the most useful
            page.
          </p>
        </div>
        <Button asChild className="shrink-0 gap-2">
          <a href="/search?focus=1">
            Search the site <ArrowUpRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </section>
  );
}
