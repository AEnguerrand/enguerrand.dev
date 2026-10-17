import type { ReactNode } from "react";
import type { CollectionEntry } from "astro:content";
import { Button } from "@once-ui-system/core/components/Button";
import { Column } from "@once-ui-system/core/components/Column";
import { Grid } from "@once-ui-system/core/components/Grid";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Row } from "@once-ui-system/core/components/Row";
import { SmartLink } from "@once-ui-system/core/components/SmartLink";
import { Text } from "@once-ui-system/core/components/Text";
import { topicHref, topicTitle } from "@/lib/topics";
import { PilotFrame, ResourceLinks } from "./PilotUI";

type Props = {
  talk: { id: string; data: CollectionEntry<"talks">["data"] };
  formattedDate: string;
  videoEmbedUrl: string | null;
  children: ReactNode;
};

export function TalkPage({
  talk,
  formattedDate,
  videoEmbedUrl,
  children,
}: Props) {
  const data = talk.data;
  const metadata = [
    ["Event", data.event],
    ["Location", data.location],
    ["Language", data.language?.join(", ")],
    ["Format", data.sessionType],
  ].filter(([, value]) => value);
  return (
    <PilotFrame>
      <Column
        as="header"
        gap="24"
        background="surface"
        border
        radius="l"
        padding="40"
        s={{ padding: "24" }}
      >
        <SmartLink href="/talks/">All talks</SmartLink>
        <Column gap="12">
          <Text as="p" variant="label-strong-s" onBackground="brand-medium">
            {data.event}
          </Text>
          <Text
            as="time"
            dateTime={data.date}
            variant="label-default-s"
            onBackground="neutral-weak"
          >
            {formattedDate}
          </Text>
          <Heading
            as="h1"
            variant="display-strong-m"
            className="pilot-talk-title"
          >
            {data.displayTitle ?? data.title}
          </Heading>
          <Text as="p" variant="body-default-l" onBackground="neutral-weak">
            {data.summary}
          </Text>
          {data.author && (
            <Text as="p" variant="body-default-s" onBackground="neutral-weak">
              By {data.author.join(", ")}
            </Text>
          )}
        </Column>
        <Column id="resources" gap="12" aria-label="Resources">
          <ResourceLinks resources={data.resources ?? []} />
        </Column>
        <Row as="nav" aria-label="On this page" gap="24" wrap>
          {videoEmbedUrl && <SmartLink href="#video">Recording</SmartLink>}
          <SmartLink href="#overview">Session overview</SmartLink>
          <SmartLink href="#content">Talk notes</SmartLink>
        </Row>
      </Column>
      {videoEmbedUrl && (
        <Column as="section" id="video" aria-labelledby="video-title" gap="24">
          <Heading as="h2" id="video-title" variant="display-strong-xs">
            Watch talk
          </Heading>
          <Column radius="l" border overflow="hidden" className="pilot-video">
            <iframe
              src={videoEmbedUrl}
              title={`Video recording for ${data.title}`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </Column>
        </Column>
      )}
      <Column
        as="section"
        id="overview"
        aria-labelledby="overview-title"
        gap="24"
      >
        <Heading as="h2" id="overview-title" variant="display-strong-xs">
          Session overview
        </Heading>
        <Grid as="dl" columns={2} s={{ columns: 1 }} gap="24">
          {metadata.map(([label, value]) => (
            <Column key={label} gap="8">
              <Text
                as="dt"
                variant="label-strong-s"
                onBackground="neutral-weak"
              >
                {label}
              </Text>
              <Text as="dd" variant="body-default-m">
                {value}
              </Text>
            </Column>
          ))}
        </Grid>
        <Row gap="16" wrap aria-label="Topics">
          {(data.tags ?? []).map((tag) => (
            <SmartLink key={tag} href={topicHref(tag)}>
              {topicTitle(tag)}
            </SmartLink>
          ))}
        </Row>
      </Column>
      <Column
        as="section"
        id="content"
        aria-label="Talk notes"
        className="prose pilot-prose"
        maxWidth={48}
      >
        {children}
      </Column>
      <Row gap="12" wrap>
        <Button href="/talks/" variant="secondary">
          All talks
        </Button>
        <Button href="/" variant="tertiary">
          Back home
        </Button>
      </Row>
    </PilotFrame>
  );
}
