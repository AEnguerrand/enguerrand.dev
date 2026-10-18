import type { CollectionEntry } from "astro:content";
import { topicTitle } from "./topics";

export function getTalkPresentation(
  talk: CollectionEntry<"talks">,
  site: URL = new URL("https://enguerrand.dev"),
) {
  const formattedDate = new Date(talk.data.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const resources = talk.data.resources ?? [];

  const videoResource = resources.find((resource) => {
    const label = resource.label.toLowerCase();
    const url = resource.url.toLowerCase();
    return (
      label.includes("video") ||
      label.includes("recording") ||
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com")
    );
  });

  const toEmbedUrl = (rawUrl: string) => {
    try {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname.toLowerCase();

      if (host.includes("youtu.be")) {
        const id = parsed.pathname.split("/").filter(Boolean)[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }

      if (host.includes("youtube.com")) {
        const id = parsed.searchParams.get("v");
        if (id) {
          return `https://www.youtube.com/embed/${id}`;
        }

        const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?#]+)/);
        if (shortsMatch) {
          return `https://www.youtube.com/embed/${shortsMatch[1]}`;
        }

        const embedMatch = parsed.pathname.match(/^\/embed\/([^/?#]+)/);
        if (embedMatch) {
          return `https://www.youtube.com/embed/${embedMatch[1]}`;
        }
      }

      if (host.includes("vimeo.com")) {
        const vimeoMatch = parsed.pathname.match(/\/(\d+)(?:$|\/)/);
        if (vimeoMatch) {
          return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }
      }
    } catch {}

    return null;
  };

  const videoEmbedUrl = videoResource ? toEmbedUrl(videoResource.url) : null;

  const sectionLinks: { href: string; label: string }[] = [];
  if (videoEmbedUrl) {
    sectionLinks.push({ href: "#video", label: "Video" });
  }
  sectionLinks.push(
    { href: "#overview", label: "Overview" },
    { href: "#resources", label: "Resources" },
    { href: "#content", label: "Content" },
  );

  const talkMetadata = [
    { label: "Event", value: talk.data.event },
    { label: "Location", value: talk.data.location },
    { label: "Language", value: talk.data.language?.join(", ") },
    { label: "Format", value: talk.data.sessionType },
  ].filter((item) => Boolean(item.value));

  const hasResources = resources.length > 0;
  const baseSectionClass = "mx-auto w-full max-w-5xl scroll-mt-40";
  const stackedSectionClass = `${baseSectionClass} mt-6 sm:mt-8`;
  const overviewSectionClass = videoEmbedUrl
    ? stackedSectionClass
    : baseSectionClass;
  const talkUrl = new URL(`/talks/${talk.id}/`, site).toString();
  const structuredData = [
    {
      "@type": "TechArticle",
      "@id": `${talkUrl}#article`,
      headline: talk.data.title,
      description: talk.data.summary,
      datePublished: talk.data.date,
      mainEntityOfPage: talkUrl,
      url: talkUrl,
      author: { "@type": "Person", "@id": new URL("/#person", site).toString(), name: "Enguerrand Allamel", url: site.toString() },
      publisher: { "@id": "https://enguerrand.dev/#person" },
      image: new URL("/og-image.jpg", site).toString(),
      keywords: talk.data.tags?.join(", "),
      about: (talk.data.tags ?? []).map((tag) => ({
        "@type": "Thing",
        name: topicTitle(tag),
      })),
      isPartOf: { "@id": "https://enguerrand.dev/#website" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://enguerrand.dev/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Talks",
          item: "https://enguerrand.dev/talks/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: talk.data.title,
          item: talkUrl,
        },
      ],
    },
    ...(videoEmbedUrl && videoResource
      ? [
          {
            "@type": "VideoObject",
            name: talk.data.title,
            description: talk.data.summary ?? `Recording of ${talk.data.title}`,
            uploadDate: talk.data.date,
            embedUrl: videoEmbedUrl,
            contentUrl: videoResource.url,
          },
        ]
      : []),
  ];
  return {
    formattedDate,
    resources,
    videoResource,
    videoEmbedUrl,
    sectionLinks,
    talkMetadata,
    hasResources,
    baseSectionClass,
    stackedSectionClass,
    overviewSectionClass,
    structuredData,
  };
}
