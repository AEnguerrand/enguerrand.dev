import { canonicalTopicPath } from "./topics";

export const siteDescription = "Talks, ideas, and field notes by Enguerrand Allamel on AI development guardrails, cloud and Kubernetes security, and secure developer platforms.";

export function canonicalUrl(path: string, site: URL): string {
  const url = new URL(path, site);
  url.search = "";
  url.hash = "";
  if (!/\.[a-z0-9]+$/i.test(url.pathname)) {
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  }
  url.pathname = canonicalTopicPath(url.pathname);
  return url.toString();
}

// The build integration writes one landscape card for each canonical page.
export function socialImagePath(path: string): string {
  const pathname = new URL(canonicalUrl(path, new URL("https://enguerrand.dev"))).pathname;
  return `/og${pathname}${pathname.endsWith("/") ? "index" : ""}.png`;
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
