import * as React from "react";
import { Github, Linkedin, Mail, MessageSquareMore } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export function ContactCard() {
  return (
    <section id="contact" className="mt-10 sm:mt-12">
      <Card className="lift-card overflow-hidden border-border/70 bg-card/90 shadow-[0_16px_42px_hsl(var(--foreground)/0.06)]">
        <CardHeader className="space-y-3">
          <h2 className="text-2xl font-semibold leading-none tracking-tight sm:text-3xl">Let&apos;s connect</h2>
          <CardDescription>
            I&apos;m always happy to chat with people working on cloud security, SRE, platform
            engineering, and open source.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 pb-8 lg:grid-cols-[1.25fr_1fr]">
          <div className="lift-card rounded-xl border border-border/70 bg-secondary/45 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              <MessageSquareMore className="h-4 w-4 text-primary" />
              Happy to chat about
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Conference talks, Kubernetes security, runtime protection, supply-chain security, and building reliable platform foundations.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full justify-start gap-2">
              <a href="mailto:hello@enguerrand.dev">
                <Mail className="h-4 w-4" />
                hello@enguerrand.dev
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <a href="https://www.linkedin.com/in/enguerrandallamel/" target="_blank" rel="noreferrer">
                <Linkedin className="h-4 w-4" />
                LinkedIn profile
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <a href="https://github.com/AEnguerrand" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" />
                github.com/AEnguerrand
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
