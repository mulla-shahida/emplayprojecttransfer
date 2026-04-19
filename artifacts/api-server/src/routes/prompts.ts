import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, promptsTable } from "@workspace/db";
import {
  CreatePromptBody,
  GetPromptParams,
  GetPromptResponse,
  ListPromptsResponse,
  GetPromptsStatsResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const viewCounts: Map<number, number> = new Map();

router.get("/prompts/stats", async (req, res): Promise<void> => {
  const prompts = await db.select().from(promptsTable);

  const total = prompts.length;
  const avgComplexity =
    total > 0
      ? prompts.reduce((sum, p) => sum + p.complexity, 0) / total
      : 0;

  const low = prompts.filter((p) => p.complexity <= 3).length;
  const medium = prompts.filter((p) => p.complexity >= 4 && p.complexity <= 6).length;
  const high = prompts.filter((p) => p.complexity >= 7).length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentCount = prompts.filter((p) => p.createdAt >= sevenDaysAgo).length;

  const stats = GetPromptsStatsResponse.parse({
    total,
    avgComplexity: Math.round(avgComplexity * 10) / 10,
    complexityBreakdown: [
      { level: "low", count: low },
      { level: "medium", count: medium },
      { level: "high", count: high },
    ],
    recentCount,
  });

  res.json(stats);
});

router.get("/prompts", async (req, res): Promise<void> => {
  const prompts = await db
    .select({
      id: promptsTable.id,
      title: promptsTable.title,
      complexity: promptsTable.complexity,
      createdAt: promptsTable.createdAt,
    })
    .from(promptsTable)
    .orderBy(promptsTable.createdAt);

  res.json(ListPromptsResponse.parse(prompts));
});

router.post("/prompts", async (req, res): Promise<void> => {
  const parsed = CreatePromptBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid prompt body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { title, content, complexity } = parsed.data;

  if (!title || title.length < 3) {
    res.status(400).json({ error: "Title must be at least 3 characters." });
    return;
  }
  if (!content || content.length < 20) {
    res.status(400).json({ error: "Content must be at least 20 characters." });
    return;
  }
  if (complexity < 1 || complexity > 10) {
    res.status(400).json({ error: "Complexity must be between 1 and 10." });
    return;
  }

  const [prompt] = await db
    .insert(promptsTable)
    .values({ title, content, complexity })
    .returning();

  res.status(201).json(GetPromptResponse.parse({ ...prompt, viewCount: 0 }));
});

router.get("/prompts/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetPromptParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [prompt] = await db
    .select()
    .from(promptsTable)
    .where(eq(promptsTable.id, params.data.id));

  if (!prompt) {
    res.status(404).json({ error: "Prompt not found" });
    return;
  }

  const currentCount = viewCounts.get(prompt.id) ?? 0;
  const newCount = currentCount + 1;
  viewCounts.set(prompt.id, newCount);

  req.log.info({ promptId: prompt.id, viewCount: newCount }, "Prompt viewed");

  res.json(
    GetPromptResponse.parse({
      ...prompt,
      viewCount: newCount,
    })
  );
});

export default router;
