export interface LearningNode {
  slug: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description?: string;
}

export const AI_ENGINEERING_ROADMAP: LearningNode[] = [
  {
    slug: "llms",
    title: "Large Language Models",
    difficulty: "Beginner",
    description: "The foundation of modern generative AI."
  },
  {
    slug: "prompt-engineering",
    title: "Prompt Engineering",
    difficulty: "Beginner",
    description: "Techniques to steer and optimize LLM outputs."
  },
  {
    slug: "embeddings",
    title: "Embeddings",
    difficulty: "Intermediate",
    description: "Mathematical representations of semantic meaning."
  },
  {
    slug: "vector-search",
    title: "Vector Databases",
    difficulty: "Intermediate",
    description: "Storing and searching semantic embeddings at scale."
  },
  {
    slug: "rag-system",
    title: "Retrieval-Augmented Generation (RAG)",
    difficulty: "Intermediate",
    description: "Grounding LLMs in proprietary data to eliminate hallucinations."
  },
  {
    slug: "langgraph-agents",
    title: "LangGraph & Stateful Workflows",
    difficulty: "Advanced",
    description: "Teaching AI to think in continuous loops."
  },
  {
    slug: "ai-agents",
    title: "AI Agents",
    difficulty: "Advanced",
    description: "Autonomous agents that can plan and execute complex tasks."
  },
  {
    slug: "mcp",
    title: "Model Context Protocol (MCP)",
    difficulty: "Advanced",
    description: "Standardized tool integration for AI agents."
  },
  {
    slug: "tool-calling",
    title: "Tool Calling",
    difficulty: "Advanced",
    description: "Equipping LLMs with external APIs and functions."
  },
  {
    slug: "multi-agent-systems",
    title: "Multi-Agent Systems",
    difficulty: "Advanced",
    description: "Orchestrating teams of specialized AI agents."
  },
  {
    slug: "production-ai",
    title: "Production AI",
    difficulty: "Advanced",
    description: "Deploying, monitoring, and scaling AI safely."
  }
];
