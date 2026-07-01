import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export const prerender = true;

export async function GET(context) {
  const articles = await getCollection("articles", (a) => !a.data.draft);
  const sorted = articles.sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );

  return rss({
    title: "Winethropocene",
    description: "Reads the climate crisis through wine.",
    site: context.site,
    items: sorted.map((a) => ({
      title: a.data.title,
      description: a.data.summary,
      pubDate: a.data.date,
      link: `/articles/${a.id}`,
    })),
  });
}
