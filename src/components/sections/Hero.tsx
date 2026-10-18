import * as React from "react";
import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export function Hero() {
  return (
    <section className="pt-3 pb-8 sm:pt-6" aria-label="Introduction">
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
            </div>
          </div>

          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Hi, I&apos;m Enguerrand. I build{" "}
            <span className="text-primary">secure and reliable cloud platforms</span>.
          </h1>
          <CardDescription className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Senior Platform Security Engineer working on AI-first development
            guardrails, cloud and Kubernetes security, and secure-by-default
            developer platforms. This site is my notebook for talks, ideas, and
            field notes from real systems.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 px-6 pb-6 sm:px-7">
          <Button asChild className="gap-2">
            <a href="#selected-talks">
              Explore talks <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="/resume">Read resume</a>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
