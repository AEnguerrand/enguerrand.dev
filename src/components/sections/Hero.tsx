import * as React from "react";
import { ArrowUpRight, Box, Link2, Radar, ShieldCheck, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";

type CurrentExploringItem = {
  title: string;
  description: string;
};

type HeroProps = {
  currentExploringTitle?: string;
  currentExploringDescription?: string;
  currentExploringItems?: CurrentExploringItem[];
};

const defaultCurrentExploringItems: CurrentExploringItem[] = [
  {
    title: "Supply-chain trust",
    description:
      "Provenance, signing, and identity-based controls that are realistic for daily developer workflows.",
  },
  {
    title: "Runtime security signals",
    description:
      "Better ways to prioritize risks using context instead of raw vulnerability counts.",
  },
  {
    title: "Platform guardrails",
    description:
      "Designing defaults that keep teams fast without creating silent reliability or security debt.",
  },
];

const currentExploringIcons = [ShieldCheck, Link2, Radar, Box, Workflow];
const markerColors = ["bg-primary", "bg-[hsl(var(--signal))]", "bg-accent", "bg-slate-500"];

export function Hero({
  currentExploringTitle = "Currently exploring",
  currentExploringDescription = "Topics I'm spending time on lately.",
  currentExploringItems,
}: HeroProps) {
  const items =
    currentExploringItems && currentExploringItems.length > 0
      ? currentExploringItems
      : defaultCurrentExploringItems;

  return (
    <section className="relative border-b border-border/80 py-10 sm:py-14 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-16 hidden h-[520px] w-56 text-xs text-muted-foreground/40 lg:block"
      >
        {["01", "02", "03", "04", "05", "06", "07", "08"].map((line) => (
          <div key={line} className="flex h-8 items-center gap-5">
            <span>{line}</span>
            {line === "08" ? <span className="h-px w-2 bg-accent" /> : <span className="h-3 w-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
        <div className="relative overflow-hidden lg:pl-20">
          <div
            aria-hidden="true"
            className="absolute right-2 top-24 hidden h-72 w-72 opacity-55 lg:block"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(var(--primary) / 0.22) 1px, transparent 1.5px)",
              backgroundSize: "12px 12px",
              maskImage: "linear-gradient(90deg, transparent, black 24%, black 72%, transparent)",
            }}
          />

          <div className="relative space-y-7">
            <div className="flex flex-wrap items-center gap-5">
              <div className="group h-24 w-24 overflow-hidden rounded-full border border-border bg-card p-1">
                <img
                  src="/avatar.webp"
                  alt="Enguerrand Allamel"
                  width={96}
                  height={96}
                  className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                  decoding="sync"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">Staff Cloud Security Engineer</p>
                <p className="text-base text-muted-foreground">
                  Security | SRE | Platform Engineering
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl leading-[0.98] sm:text-6xl lg:text-[4.45rem]">
                Hi, I&apos;m Enguerrand. <span className="whitespace-nowrap">I build</span>{" "}
                <span className="text-primary">secure and reliable</span> cloud platforms.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Staff Cloud Security Engineer with hands-on production experience in Kubernetes,
                AWS, Python, Go, and CI/CD. This site is my notebook for talks, ideas, and
                field notes from real systems.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="gap-2">
                <a href="/talks">
                  Explore talks <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href="/resume">Read resume</a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href="/radar">Open radar</a>
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <a href="#contact">Say hello</a>
              </Button>
            </div>
          </div>
        </div>

        <aside className="border-border/80 lg:border-l lg:pl-12">
          <div className="mb-7 space-y-2">
            <h2 className="text-3xl leading-tight">{currentExploringTitle}</h2>
            <p className="text-sm text-muted-foreground">{currentExploringDescription}</p>
          </div>
          <div className="divide-y divide-border/80">
            {items.map((item, index) => {
              const Icon = currentExploringIcons[index % currentExploringIcons.length];

              return (
                <div
                  key={`${item.title}-${index}`}
                  className="grid gap-4 py-5 sm:grid-cols-[2.75rem_1fr_auto]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold leading-tight">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                  <span className={`mt-3 hidden h-2 w-2 rounded-full sm:block ${markerColors[index % markerColors.length]}`} />
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
