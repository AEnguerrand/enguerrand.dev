import * as React from "react";
import { ArrowUpRight, Radar, ShieldCheck, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
    <section className="pt-3 pb-12 sm:pt-6">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="lift-card overflow-hidden border-border/70 shadow-[0_18px_50px_hsl(var(--foreground)/0.07)]">
          <CardHeader className="space-y-6 p-7 sm:p-9">
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

            <CardTitle className="max-w-3xl text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Hi, I&apos;m Enguerrand. I build{" "}
              <span className="text-primary">secure and reliable cloud platforms</span>.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Senior Platform Security Engineer working on AI-first development guardrails,
              cloud and Kubernetes security, and secure-by-default developer platforms. This
              site is my notebook for talks, ideas, and field notes from real systems.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 px-7 pb-8 sm:px-9">
            <Button asChild className="gap-2">
              <a href="/talks">
                Explore talks <ArrowUpRight className="h-4 w-4" />
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
            <CardTitle className="text-2xl">{currentExploringTitle}</CardTitle>
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
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </div>
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
