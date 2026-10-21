import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const talks = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/talks" }),
  schema: z
    .object({
      title: z.string(),
      displayTitle: z.string().optional(),
      seoTitle: z.string().optional(),
      date: z.string(),
      author: z.array(z.string()).optional(),
      event: z.string().optional(),
      location: z.string().optional(),
      summary: z.string().optional(),
      language: z.array(z.string()).optional(),
      sessionType: z.string().optional(),
      tags: z.array(z.string()).optional(),
      resources: z
        .array(
          z.object({
            label: z.string(),
            url: z.url(),
          })
        )
        .optional(),
    })
    .passthrough(),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/pages" }),
  schema: z
    .object({
      title: z.string().optional(),
      layout: z.string().optional(),
      projects: z.array(z.object({
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
        url: z.url().refine((value) => /^https?:\/\//.test(value), "Use an HTTP or HTTPS project URL."),
        status: z.string().trim().min(1),
        action: z.string().trim().min(1),
        image: z.string().trim().min(1).optional(),
        imageAlt: z.string().trim().min(1).optional(),
      })).default([]),
      currentExploringTitle: z.string().optional(),
      currentExploringUpdated: z.string().optional(),
      currentExploring: z
        .array(
          z.object({
            title: z.string(),
            description: z.string(),
          })
        )
        .optional(),
    })
    .passthrough(),
});

const publicationDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.").refine(
  (value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  },
  "Use a valid calendar date.",
);

const posts = defineCollection({
  loader: glob({ pattern: "[^_]*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    draft: z.boolean().default(true),
    publishDate: publicationDate.optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
  }).superRefine((post, context) => {
    if (!post.draft && !post.publishDate) {
      context.addIssue({
        code: "custom",
        path: ["publishDate"],
        message: "A published post must have a publishDate.",
      });
    }
  }),
});

export const collections = { talks, pages, posts };
