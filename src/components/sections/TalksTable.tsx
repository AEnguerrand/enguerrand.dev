import * as React from "react";
import { CalendarDays, ChevronRight } from "lucide-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

type TalksTableProps = {
  title: string;
  talks: Talk[];
  showViewAll?: boolean;
};

export function TalksTable({ title, talks, showViewAll = true }: TalksTableProps) {
  return (
    <section className="site-section-divider">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-3xl">{title}</h2>
        {showViewAll && (
          <a href="/talks/" className="site-text-link font-medium">
            View all <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </header>
      <div className="mt-5 space-y-6">
        <aside className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 border-y border-border py-4">
          <CalendarDays className="h-4 w-4" />
          <div>
            <h3 className="font-semibold leading-none">Speaking archive</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Open any talk for full abstracts and resources. New sessions are added as they are published.
            </p>
          </div>
        </aside>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px] font-semibold tracking-[0.08em] uppercase">Date</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-[0.08em] uppercase">Talk</TableHead>
              <TableHead className="text-[11px] font-semibold tracking-[0.08em] uppercase">Tags</TableHead>
              <TableHead className="text-right text-[11px] font-semibold tracking-[0.08em] uppercase">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {talks.map((talk) => (
              <TableRow key={talk.id} className="site-list-row hover:bg-primary/[0.035]">
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(talk.data.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <a href={`/talks/${talk.id}/`} className="hover:text-primary">{talk.data.title}</a>
                    {talk.data.event && (
                      <p className="text-xs font-normal text-muted-foreground">{talk.data.event}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {(talk.data.tags ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(talk.data.tags ?? []).slice(0, 3).map((tag) => (
                        <a
                          key={`${talk.id}-${tag}`}
                          href={topicHref(tag)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {topicTitle(tag)}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <a href={`/talks/${talk.id}/`} aria-label={`Details: ${talk.data.title}`} className="site-text-link justify-end text-sm font-medium">Details</a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
