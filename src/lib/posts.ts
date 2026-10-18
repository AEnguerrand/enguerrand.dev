import { getCollection, type CollectionEntry } from "astro:content";

type Post = CollectionEntry<"posts">;
type PublicationData = Pick<Post["data"], "draft" | "publishDate">;

// Dates are calendar dates. Publication starts at midnight UTC on that date.
export function isPublishedPost(data: PublicationData, now = new Date()): boolean {
  if (data.draft || !data.publishDate) return false;
  const timestamp = Date.parse(`${data.publishDate}T00:00:00.000Z`);
  return Number.isFinite(timestamp) && timestamp <= now.getTime();
}

interface PostOptions { includeUnpublished?: boolean; now?: Date }

// Callers can request unpublished entries for local development only.
export async function getPosts({ includeUnpublished = false, now = new Date() }: PostOptions = {}): Promise<Post[]> {
  const posts = await getCollection("posts");
  return posts
    .filter((post) => includeUnpublished || isPublishedPost(post.data, now))
    .sort((left, right) =>
      (right.data.publishDate ?? "").localeCompare(left.data.publishDate ?? "") || left.id.localeCompare(right.id),
    );
}

export function postHref(id: string): string {
  return `/blog/${id.split("/").map(encodeURIComponent).join("/")}/`;
}

export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00.000Z`));
}
