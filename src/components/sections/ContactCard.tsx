import * as React from "react";
import { Github, Linkedin, Mail, MapPin, MessageSquareMore } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ContactCard() {
  return (
    <section id="contact" className="py-10 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-6">
          <p className="section-label">Get in touch</p>
          <div className="space-y-4">
            <h2 className="text-4xl leading-tight sm:text-5xl">Let&apos;s connect</h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              I&apos;m always happy to chat with people working on cloud security, SRE, platform
              engineering, and open source.
            </p>
          </div>

          <div className="border-l border-border pl-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground" style={{ letterSpacing: "0.08em" }}>
              <MessageSquareMore className="h-4 w-4 text-primary" />
              Happy to chat about
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Conference talks, Kubernetes security, runtime protection, supply-chain security, and building reliable platform foundations.
            </p>
          </div>
        </div>

        <div className="editorial-panel rounded-lg p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-xs font-semibold uppercase text-muted-foreground" style={{ letterSpacing: "0.12em" }}>
            <span className="h-3 w-3 rounded-full bg-accent" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-[hsl(var(--signal))]" />
            <span className="ml-auto text-[10px] text-[hsl(var(--signal))]">system-status</span>
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
                linkedin.com/in/enguerrandallamel
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start gap-2">
              <a href="https://github.com/AEnguerrand" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" />
                github.com/AEnguerrand
              </a>
            </Button>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Vancouver, BC
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
