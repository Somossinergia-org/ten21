export type CognitiveBlocks = {
  facts: string[];
  inferences: string[];
  recommendations: string[];
  other: string;
};

const PREFIXES = {
  fact: /^\s*(?:[-*•]\s*)?(?:\d+[.)]\s*)?(?:\*{0,2})\s*HECHOS?\s*:?\s*/i,
  inference: /^\s*(?:[-*•]\s*)?(?:\d+[.)]\s*)?(?:\*{0,2})\s*INFERENCIAS?\s*:?\s*/i,
  recommendation: /^\s*(?:[-*•]\s*)?(?:\d+[.)]\s*)?(?:\*{0,2})\s*RECOMENDACI[OÓ]NE?S?\s*:?\s*/i,
};

function stripMarkers(line: string): string {
  return line
    .replace(/\*\*/g, "")
    .replace(/^\s*[-*•]\s*/, "")
    .replace(/^\s*\d+[.)]\s*/, "")
    .trim();
}

export function parseCognitive(text: string): CognitiveBlocks {
  const facts: string[] = [];
  const inferences: string[] = [];
  const recommendations: string[] = [];
  const other: string[] = [];

  if (!text) return { facts, inferences, recommendations, other: "" };

  const lines = text.split(/\r?\n/);
  let currentBucket: "fact" | "inference" | "recommendation" | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      currentBucket = null;
      continue;
    }

    let matched: "fact" | "inference" | "recommendation" | null = null;
    let content = "";

    if (PREFIXES.fact.test(rawLine)) {
      matched = "fact";
      content = rawLine.replace(PREFIXES.fact, "").trim();
    } else if (PREFIXES.inference.test(rawLine)) {
      matched = "inference";
      content = rawLine.replace(PREFIXES.inference, "").trim();
    } else if (PREFIXES.recommendation.test(rawLine)) {
      matched = "recommendation";
      content = rawLine.replace(PREFIXES.recommendation, "").trim();
    }

    if (matched) {
      currentBucket = matched;
      const cleaned = stripMarkers(content);
      if (cleaned) {
        if (matched === "fact") facts.push(cleaned);
        else if (matched === "inference") inferences.push(cleaned);
        else recommendations.push(cleaned);
      }
      continue;
    }

    if (currentBucket && (line.startsWith("-") || line.startsWith("•") || line.startsWith("*"))) {
      const cleaned = stripMarkers(line);
      if (!cleaned) continue;
      if (currentBucket === "fact") facts.push(cleaned);
      else if (currentBucket === "inference") inferences.push(cleaned);
      else recommendations.push(cleaned);
      continue;
    }

    currentBucket = null;
    other.push(line);
  }

  return {
    facts,
    inferences,
    recommendations,
    other: other.join("\n").trim(),
  };
}

export function hasCognitiveStructure(text: string): boolean {
  return PREFIXES.fact.test(text) || PREFIXES.inference.test(text) || PREFIXES.recommendation.test(text);
}
