import * as React from "react";
import { Github, Linkedin, Mail } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export function ContactCard() {
  const linkClass = "inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary hover:underline";

  return (
    <section id="contact" aria-labelledby="contact-title" className="mt-8">
      <Card className="lift-card border-border/70 bg-card/90 shadow-[0_16px_42px_hsl(var(--foreground)/0.06)]">
        <CardHeader className="space-y-2 pb-2">
          <h2 id="contact-title" className="text-2xl font-semibold tracking-tight">Let&apos;s connect</h2>
          <CardDescription>
            Have a question about security, platforms, or a talk? Get in touch.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-6">
          <a href="mailto:hello@enguerrand.dev" className={linkClass}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            hello@enguerrand.dev
          </a>
          <a href="https://www.linkedin.com/in/enguerrandallamel/" target="_blank" rel="noreferrer" className={linkClass}>
            <Linkedin className="h-4 w-4" aria-hidden="true" />
            LinkedIn
          </a>
          <a href="https://github.com/AEnguerrand" target="_blank" rel="noreferrer" className={linkClass}>
            <Github className="h-4 w-4" aria-hidden="true" />
            GitHub
          </a>
        </CardContent>
      </Card>
    </section>
  );
}
