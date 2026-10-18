import * as React from "react";
import { CalendarDays, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
    <Card className="border-border/70 bg-card/85 shadow-[0_18px_48px_hsl(var(--foreground)/0.06)]">
      <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <CardTitle className="text-3xl">{title}</CardTitle>
        {showViewAll && (
          <Button asChild variant="outline" size="sm" className="gap-1">
            <a href="/talks/">
              View all <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-border/80 bg-secondary/55">
          <CalendarDays className="h-4 w-4" />
          <AlertTitle className="font-semibold">Speaking archive</AlertTitle>
          <AlertDescription>
            Open any talk for full abstracts and resources. New sessions are added as they are published.
          </AlertDescription>
        </Alert>

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
              <TableRow key={talk.id} className="hover:bg-secondary/45">
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {new Date(talk.data.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <p>{talk.data.title}</p>
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
                          className="rounded-full border border-border/70 bg-secondary/60 px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary hover:text-foreground"
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
                  <Button asChild variant="outline" size="sm">
                    <a href={`/talks/${talk.id}/`}>Details</a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
