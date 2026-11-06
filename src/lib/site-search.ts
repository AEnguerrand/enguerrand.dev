import { getCollection, getEntry } from "astro:content";
import { getPosts, postHref } from "./posts";
import { starsGroups, starsListHref, starsListName, starsListDescription } from "./stars";
import { canonicalTopics, topicDescription, topicHref, topicTitle } from "./topics";
import { resumeSearchText } from "@/data/resume";

export const searchLabels = {
  page: "Page", talk: "Talk", project: "Project", post: "Post",
  repository: "Repository topic", topic: "Talk topic",
};

export interface SearchItem {
  id: string;
  kind: keyof typeof searchLabels;
  title: string;
  href: string;
  summary?: string;
  content?: string;
  tags?: string[];
  event?: string;
  fullTitle?: string;
  date?: string;
}

const pages = [
  ["home", "Home", "/", "Enguerrand Allamel, platform security, selected talks and current exploration topics."],
  ["talks", "Talks", "/talks/", "Conference talks, workshops, videos, slides and labs."],
  ["projects", "Projects", "/projects/", "Independent software, open source projects and tools for paper records."],
  ["radar", "Radar", "/radar/", "Selected technical signals and a library of GitHub bookmarks."],
  ["blog", "Blog", "/blog/", "Articles and field notes on life in Canada, security, and AI."],
  ["about", "About", "/about/", "About Enguerrand Allamel, his work, biography and public resume."],
  ["resume", "Resume", "/resume/", "Work experience, skills and CV."],
  ["stars", "Repository topics", "/github-stars/", "GitHub bookmarks organized by topic."],
  ["topics", "Talk topics", "/topics/", "Browse talks by subject and tag."],
  ["search", "Search", "/search/", "Full site search."],
  ["privacy", "Privacy", "/privacy/", "Website analytics and data handling information."],
];

export async function getSearchItems(): Promise<SearchItem[]> {
  const [home, talks, posts] = await Promise.all([
    getEntry("pages", "home"), getCollection("talks"), getPosts(),
  ]);
  const topics = canonicalTopics(talks.flatMap(talk => talk.data.tags ?? []));
  return [
    ...pages.filter(([id]) => id !== "blog" || posts.length > 0).map(([id, title, href, summary]): SearchItem => ({
      id: `page-${id}`, kind: "page", title, href, summary,
      content: id === "resume" ? resumeSearchText : undefined,
    })),
    ...(home?.data.projects ?? []).map((project, i): SearchItem => ({
      id: `project-${i}`, kind: "project", title: project.title, href: project.url,
      summary: project.description, tags: [project.status],
    })),
    ...talks.map((talk): SearchItem => ({
      id: `talk-${talk.id}`, kind: "talk", title: talk.data.displayTitle ?? talk.data.title,
      href: `/talks/${talk.id}/`, summary: talk.data.summary, event: talk.data.event,
      fullTitle: talk.data.displayTitle ? talk.data.title : undefined,
      date: talk.data.date, tags: talk.data.tags, content: [talk.data.title, talk.body].join(" "),
    })),
    ...posts.map((post): SearchItem => ({
      id: `post-${post.id}`, kind: "post", title: post.data.title, href: postHref(post.id),
      summary: post.data.description, tags: post.data.tags, date: post.data.publishDate, content: post.body,
    })),
    ...starsGroups.map((group): SearchItem => ({
      id: `stars-${group.slug}`, kind: "repository", title: starsListName(group.name), href: starsListHref(group.slug),
      summary: starsListDescription(group), tags: [group.slug.replaceAll("-", " ")],
    })),
    ...Array.from(topics, (topic): SearchItem => ({
      id: `topic-${topic}`, kind: "topic", title: topicTitle(topic), href: topicHref(topic), summary: topicDescription(topic),
    })),
  ];
}
