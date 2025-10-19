import { z } from 'zod';

// Zod schemas for validation

export const ExpandableTermSchema = z.object({
  id: z.string(),
  term: z.string(),
  startIndex: z.number(),
  endIndex: z.number(),
  summary: z.string().optional(),
});

export const ExplanationNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    text: z.string(),
    expandableTerms: z.array(ExpandableTermSchema),
  })
);

export const ExplainRequestSchema = z.object({
  topic: z.string().min(1).max(500),
  options: z
    .object({
      includeExamples: z.boolean().optional(),
      includeUseCases: z.boolean().optional(),
      includePitfalls: z.boolean().optional(),
      tone: z.enum(['concise', 'balanced', 'detailed']).optional(),
      complexity: z.number().min(1).max(5).optional(),
    })
    .optional(),
});

export const ExplainResponseSchema = z.object({
  topic: z.string(),
  root: ExplanationNodeSchema,
  metadata: z.object({
    estimatedReadTime: z.number(),
    complexityLevel: z.string(),
    totalExpandableTerms: z.number(),
  }),
});

export const ExpandRequestSchema = z.object({
  topic: z.string().min(1),
  termId: z.string(),
  term: z.string().min(1),
  parentContext: z.string(),
  depth: z.number().min(0).max(5),
});

export const ExpandResponseSchema = z.object({
  termId: z.string(),
  node: ExplanationNodeSchema,
});
