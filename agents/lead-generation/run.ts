import { chatCompletionJson } from "@/lib/ai/openrouter";
import { AGENT_SKILL_PROMPT } from "@/lib/prompts/agent-skill";
import { searchCompanies } from "@/tools/tavily-search";
import { leadsResponseSchema, type Lead } from "@/tools/lead-schema";

export function loadAgentSkill(): string {
  return AGENT_SKILL_PROMPT;
}

function dedupeLeads(items: Lead[]): Lead[] {
  const seen = new Set<string>();
  return items.filter((lead) => {
    const key = (lead.website ?? lead.company).toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildResearchContext(
  results: Awaited<ReturnType<typeof searchCompanies>>
): string {
  const blocks = results.results.map(
    (r, i) =>
      `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 800)}`
  );
  const header = results.answer
    ? `Research summary:\n${results.answer}\n\nSources:\n`
    : "Sources:\n";
  return header + blocks.join("\n\n");
}

async function extractLeadsFromResearch(
  userQuery: string,
  research: Awaited<ReturnType<typeof searchCompanies>>
): Promise<Lead[]> {
  const system = loadAgentSkill();
  const user = `User query: ${userQuery}\n\n${buildResearchContext(research)}`;

  const parse = (raw: string) => {
    const json = JSON.parse(raw) as unknown;
    return leadsResponseSchema.parse(json).leads;
  };

  let raw = await chatCompletionJson({ system, user });

  try {
    return dedupeLeads(parse(raw));
  } catch {
    raw = await chatCompletionJson({
      system: `${system}\n\nYour previous response was invalid JSON. Return valid JSON only with a "leads" array.`,
      user,
    });
    return dedupeLeads(parse(raw));
  }
}

export async function runLeadGeneration(userQuery: string): Promise<Lead[]> {
  const research = await searchCompanies(userQuery);
  if (research.results.length === 0) {
    throw new Error("No research results found for this query. Try a broader search.");
  }
  return extractLeadsFromResearch(userQuery, research);
}
