import { requireEnv } from "@/lib/env";

export type SearchResult = {
  title: string;
  url: string;
  content: string;
};

type TavilyResponse = {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
  }>;
  answer?: string;
};

export function buildSearchQueries(userQuery: string): string[] {
  const trimmed = userQuery.trim();
  return [
    `${trimmed} companies startups founders contact`,
    `${trimmed} business directory list`,
  ];
}

export async function searchCompanies(userQuery: string): Promise<{
  results: SearchResult[];
  answer?: string;
}> {
  const apiKey = requireEnv("TAVILY_API_KEY");
  const queries = buildSearchQueries(userQuery);
  const allResults: SearchResult[] = [];
  let combinedAnswer: string | undefined;

  for (const query of queries.slice(0, 2)) {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        include_answer: true,
        max_results: 6,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Tavily search failed: ${res.status} ${err}`);
    }

    const data = (await res.json()) as TavilyResponse;
    if (data.answer && !combinedAnswer) {
      combinedAnswer = data.answer;
    }

    for (const item of data.results ?? []) {
      if (!item.url || !item.title) continue;
      allResults.push({
        title: item.title,
        url: item.url,
        content: item.content ?? "",
      });
    }
  }

  const seen = new Set<string>();
  const deduped = allResults.filter((r) => {
    try {
      const host = new URL(r.url).hostname;
      if (seen.has(host)) return false;
      seen.add(host);
      return true;
    } catch {
      return false;
    }
  });

  return { results: deduped.slice(0, 12), answer: combinedAnswer };
}
