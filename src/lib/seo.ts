export const siteDescription = "Talks, ideas, and field notes by Enguerrand Allamel on AI development guardrails, cloud and Kubernetes security, and secure developer platforms.";
export const siteImage = "/og-image.jpg";

export function canonicalUrl(path: string, site: URL): string {
  const url = new URL(path, site);
  url.search = "";
  url.hash = "";
  if (!/\.[a-z0-9]+$/i.test(url.pathname)) {
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  }
  return url.toString();
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
