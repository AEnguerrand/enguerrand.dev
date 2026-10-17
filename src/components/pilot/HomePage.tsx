import type { CollectionEntry } from "astro:content";
import { Button } from "@once-ui-system/core/components/Button";
import { Column } from "@once-ui-system/core/components/Column";
import { Grid } from "@once-ui-system/core/components/Grid";
import { Heading } from "@once-ui-system/core/components/Heading";
import { Media } from "@once-ui-system/core/components/Media";
import { Row } from "@once-ui-system/core/components/Row";
import { SmartLink } from "@once-ui-system/core/components/SmartLink";
import { Text } from "@once-ui-system/core/components/Text";
import { PilotContact, PilotFrame, ResourceLinks } from "./PilotUI";

type Props = {
  talks: { id: string; data: CollectionEntry<"talks">["data"] }[];
  exploring: CollectionEntry<"pages">["data"];
};

export function HomePage({ talks, exploring }: Props) {
  return (
    <PilotFrame>
      <Column
        as="section"
        aria-labelledby="intro-title"
        gap="24"
        background="surface"
        border
        radius="l"
        padding="40"
        s={{ padding: "24" }}
      >
        <Row gap="16" vertical="center">
          <Media
            src="/avatar.webp"
            alt="Enguerrand Allamel"
            width="56"
            height={3.5}
            fillWidth={false}
            aspectRatio="1/1"
            radius="full"
            priority
          />
          <Column gap="4">
            <Text variant="label-strong-s" onBackground="brand-medium">
              Senior Platform Security Engineer
            </Text>
            <Text variant="body-default-s" onBackground="neutral-weak">
              Security · SRE · Platform Engineering
            </Text>
          </Column>
        </Row>
        <Heading
          as="h1"
          id="intro-title"
          variant="display-strong-l"
          className="pilot-hero-title"
        >
          Hi, I’m Enguerrand. I build{" "}
          <Text as="span" family="heading" onBackground="brand-medium">
            secure and reliable cloud platforms.
          </Text>
        </Heading>
        <Column maxWidth={46}>
          <Text as="p" variant="body-default-l" onBackground="neutral-weak">
            I work on cloud and Kubernetes security, AI development guardrails,
            and developer platforms. Here I share practical lessons from
            production systems, conference talks, and hands-on labs.
          </Text>
        </Column>
        <Row gap="12" wrap>
          <Button href="#selected-talks">Explore selected talks</Button>
          <Button href="/resume" variant="secondary">
            Read resume
          </Button>
          <Button href="#contact" variant="tertiary">
            Say hello
          </Button>
        </Row>
      </Column>

      <Column
        as="section"
        id="selected-talks"
        aria-labelledby="talks-title"
        gap="32"
      >
        <Row
          gap="24"
          horizontal="between"
          vertical="end"
          s={{ direction: "column", horizontal: "start", vertical: "start" }}
        >
          <Column gap="12">
            <Text variant="label-default-s" onBackground="brand-medium">
              Speaking & practical work
            </Text>
            <Heading as="h2" id="talks-title" variant="display-strong-s">
              Selected talks
            </Heading>
            <Text as="p" variant="body-default-m" onBackground="neutral-weak">
              Recordings, slides, and examples from KubeCon, AWS Summit, and
              OWASP.
            </Text>
          </Column>
          <Button href="/talks" variant="secondary">
            All talks
          </Button>
        </Row>
        <Grid columns={3} m={{ columns: 1 }} gap="24">
          {talks.map((talk) => (
            <Column
              as="article"
              key={talk.id}
              gap="20"
              background="surface"
              border
              radius="l"
              padding="24"
            >
              <Text
                as="time"
                dateTime={talk.data.date}
                variant="label-default-s"
                onBackground="neutral-weak"
              >
                {new Date(talk.data.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </Text>
              <Column gap="12" flex={1}>
                <Heading as="h3" variant="heading-strong-l">
                  <SmartLink href={`/talks/${talk.id}/`} unstyled>
                    {talk.data.displayTitle ??
                      talk.data.seoTitle ??
                      talk.data.title}
                  </SmartLink>
                </Heading>
                <Text
                  as="p"
                  variant="label-default-s"
                  onBackground="brand-medium"
                >
                  {talk.data.event}
                </Text>
                <Text
                  as="p"
                  variant="body-default-s"
                  onBackground="neutral-weak"
                >
                  {talk.data.summary}
                </Text>
              </Column>
              <ResourceLinks
                resources={(talk.data.resources ?? []).filter((r) =>
                  /video|recording|slide|lab/i.test(r.label),
                )}
                compact
              />
              <SmartLink href={`/talks/${talk.id}/`}>Session details</SmartLink>
            </Column>
          ))}
        </Grid>
      </Column>

      <Column as="section" aria-labelledby="exploring-title" gap="24">
        <Column gap="12">
          <Heading as="h2" id="exploring-title" variant="display-strong-xs">
            {exploring.currentExploringTitle ?? "What I’m exploring now"}
          </Heading>
          <Text as="p" variant="body-default-m" onBackground="neutral-weak">
            {exploring.currentExploringDescription}
          </Text>
        </Column>
        <Grid columns={2} s={{ columns: 1 }} gap="32">
          {(exploring.currentExploring ?? []).map((item) => (
            <Column key={item.title} gap="8">
              <Heading as="h3" variant="heading-strong-s">
                {item.title}
              </Heading>
              <Text as="p" variant="body-default-s" onBackground="neutral-weak">
                {item.description}
              </Text>
            </Column>
          ))}
        </Grid>
        <SmartLink href="/radar/">Browse curated resources</SmartLink>
      </Column>
      <PilotContact />
    </PilotFrame>
  );
}
