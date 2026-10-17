import type { ReactNode } from "react";
import { Button } from "@once-ui-system/core/components/Button";
import { Column } from "@once-ui-system/core/components/Column";
import { Heading } from "@once-ui-system/core/components/Heading";
import { LayoutProvider } from "@once-ui-system/core/contexts";
import { Row } from "@once-ui-system/core/components/Row";
import { Text } from "@once-ui-system/core/components/Text";

export type Resource = { label: string; url: string };

export function PilotFrame({ children }: { children: ReactNode }) {
  // Astro renders this tree to HTML. Native links need no client hydration.
  return (
    <LayoutProvider>
      <Column className="once-ui" fillWidth gap="80" paddingTop="24">
        {children}
      </Column>
    </LayoutProvider>
  );
}

export function ResourceLinks({
  resources,
  compact = false,
}: {
  resources: Resource[];
  compact?: boolean;
}) {
  if (resources.length === 0) return null;
  return (
    <Row gap="8" wrap aria-label="Session resources">
      {resources.map((resource, index) => {
        const label = /video|recording/i.test(resource.label)
          ? "Watch talk"
          : /slide/i.test(resource.label)
            ? "Slides"
            : /lab|repository/i.test(resource.label)
              ? "Open lab"
              : resource.label;
        return (
          <Button
            key={resource.url}
            href={resource.url}
            size={compact ? "s" : "m"}
            variant={
              compact ? "tertiary" : index === 0 ? "primary" : "secondary"
            }
            aria-label={`${label}: ${resource.label}`}
            suffixIcon="arrowUpRight"
          >
            {label}
          </Button>
        );
      })}
    </Row>
  );
}

export function PilotContact() {
  return (
    <Column
      as="section"
      id="contact"
      aria-labelledby="contact-title"
      gap="24"
      background="surface"
      border
      radius="l"
      padding="32"
      s={{ padding: "24" }}
    >
      <Column gap="12">
        <Text variant="label-default-s" onBackground="brand-medium">
          Contact
        </Text>
        <Heading as="h2" id="contact-title" variant="display-strong-xs">
          Let’s connect
        </Heading>
        <Text as="p" variant="body-default-m" onBackground="neutral-weak">
          Happy to chat about conference talks, cloud security, SRE, and
          building reliable platforms.
        </Text>
      </Column>
      <Row gap="12" wrap>
        <Button href="mailto:hello@enguerrand.dev">Say hello by email</Button>
        <Button
          href="https://www.linkedin.com/in/enguerrandallamel/"
          variant="secondary"
        >
          LinkedIn
        </Button>
        <Button href="https://github.com/AEnguerrand" variant="secondary">
          GitHub
        </Button>
      </Row>
    </Column>
  );
}
