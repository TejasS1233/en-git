const DOMAIN_MAP = {
  "Systems Programming": {
    languages: ["C", "C++", "Rust", "Assembly", "Zig"],
    topics: ["linux", "kernel", "operating-system", "embedded", "systems", "compiler", "low-level"],
    weight: 3, // Higher weight for specialized domains
  },
  "AI/ML": {
    languages: ["Python"],
    topics: [
      "tensorflow",
      "pytorch",
      "scikit-learn",
      "machine-learning",
      "deep-learning",
      "neural-network",
      "ai",
      "ml",
    ],
    weight: 3,
  },
  "Data Science": {
    languages: ["Python", "R", "Julia"],
    topics: [
      "pandas",
      "numpy",
      "matplotlib",
      "jupyter",
      "data-science",
      "analytics",
      "visualization",
    ],
    weight: 2.5,
  },
  "Mobile Development": {
    languages: ["Kotlin", "Swift", "Dart", "Objective-C"],
    topics: ["android", "ios", "flutter", "react-native", "mobile"],
    weight: 2.5,
  },
  "Game Development": {
    languages: ["C++", "C#", "GDScript"],
    topics: ["unity", "unreal", "godot", "game", "gamedev", "gaming"],
    weight: 2.5,
  },
  "DevOps/Infrastructure": {
    languages: ["Shell", "Python", "Go", "HCL"],
    topics: [
      "docker",
      "kubernetes",
      "ci",
      "cd",
      "github-actions",
      "terraform",
      "ansible",
      "devops",
      "infrastructure",
    ],
    weight: 2,
  },
  "Blockchain/Web3": {
    languages: ["Solidity", "Rust", "Go"],
    topics: ["blockchain", "ethereum", "web3", "smart-contract", "cryptocurrency", "defi"],
    weight: 2.5,
  },
  "Backend Development": {
    languages: ["Go", "Java", "Python", "Ruby", "PHP", "Elixir"],
    topics: ["api", "backend", "server", "microservices", "database", "graphql", "rest"],
    weight: 1.5,
  },
  "Web Development": {
    languages: ["JavaScript", "TypeScript", "HTML", "CSS"],
    topics: ["react", "vue", "angular", "nextjs", "svelte", "tailwindcss", "frontend", "web"],
    weight: 1, // Lower weight since it's common
  },
};

export function inferDomain(languagePercents, topTopics) {
  // languagePercents: [ [lang, percent], ... ] sorted desc
  const langMap = new Map(languagePercents);
  const topicSet = new Set(topTopics.map(([t]) => t));

  const scores = {};

  for (const [domain, { languages, topics, weight }] of Object.entries(DOMAIN_MAP)) {
    let score = 0;

    // Language matching with percentage weighting
    for (const lang of languages) {
      if (langMap.has(lang)) {
        const percentage = langMap.get(lang);
        // More weight for primary languages (higher percentage)
        score += (percentage / 10) * weight;
      }
    }

    // Topic matching
    let topicMatches = 0;
    for (const topic of topics) {
      if (topicSet.has(topic)) {
        topicMatches++;
      }
    }
    // More weight if multiple topics match
    score += topicMatches * weight;

    scores[domain] = score;
  }

  // Get top domain
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const best = sortedScores[0];

  // If score is too low, classify as Generalist
  const domain = best && best[1] > 2 ? best[0] : "Generalist";

  return { domain, scores };
}
