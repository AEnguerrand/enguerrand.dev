import * as React from "react";
import { ArrowUpRight, Radar, ShieldCheck, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

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

const currentExploringIcons = [ShieldCheck, Radar, Workflow];

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
    <section className="pt-3 pb-12 sm:pt-6" aria-label="Introduction and current interests">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="lift-card overflow-hidden border-border/70 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)]">
          <CardHeader className="space-y-4 p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-4">
              <div className="group h-14 w-14 overflow-hidden rounded-full ring-2 ring-primary/20">
                <img
                  src="/avatar.webp"
                  alt="Enguerrand Allamel"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="w-fit border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20">
                  Senior Platform Security Engineer
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Security | SRE | Platform Engineering
                </p>
              </div>
            </div>

            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Hi, I&apos;m Enguerrand. I build{" "}
              <span className="text-primary">secure and reliable cloud platforms</span>.
            </h1>
            <CardDescription className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              I work on cloud and Kubernetes security, AI development guardrails,
              and developer platforms. Here I share practical lessons from
              production systems, conference talks, and hands-on labs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 px-6 pb-6 sm:px-7">
            <Button asChild className="gap-2">
              <a href="#selected-talks">
                Explore selected talks <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/resume">Read resume</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/radar">Open radar</a>
            </Button>
            <Button asChild variant="outline">
              <a href="#contact">Say hello</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="lift-card border-border/70 bg-card/90 shadow-[0_14px_38px_hsl(var(--foreground)/0.06)]">
          <CardHeader className="space-y-1">
            <h2 id="exploring-title" className="text-2xl font-semibold leading-none tracking-tight">{currentExploringTitle}</h2>
            <CardDescription>{currentExploringDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => {
              const Icon = currentExploringIcons[index % currentExploringIcons.length];

              return (
                <div
                  key={`${item.title}-${index}`}
                  className="lift-card rounded-xl border border-border/70 bg-secondary/55 p-4"
                >
                  <h3 className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
