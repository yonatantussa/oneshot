import OpenAI from 'openai';
import type {
  ExplainRequest,
  ExplainResponse,
  ExpandRequest,
  ExpandResponse,
} from '@/types';
import { ExplainResponseSchema, ExpandResponseSchema } from '@/lib/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_NAME = process.env.MODEL_NAME || 'gpt-4o-mini';

// System prompt for generating initial explanations
const EXPLAIN_SYSTEM_PROMPT = `You are an expert explainer that creates concise, expandable explanations.

Your task is to explain topics in a clear, engaging way with embedded expandable terms. The explanation should be readable in about 60 seconds.

IMPORTANT: Identify 5-8 key concepts/terms that a curious reader might want to explore deeper. Mark these terms for expansion.

Return ONLY valid JSON matching this schema:
{
  "topic": "string",
  "root": {
    "id": "root",
    "text": "The main explanation text...",
    "expandableTerms": [
      {
        "id": "unique-id",
        "term": "TLS",
        "startIndex": 25,
        "endIndex": 28,
        "summary": "Brief tooltip preview of what this expands to"
      }
    ]
  },
  "metadata": {
    "estimatedReadTime": 60,
    "complexityLevel": "intermediate",
    "totalExpandableTerms": 7
  }
}

Rules:
- Make the root text engaging and complete (but concise)
- Select terms that add meaningful depth when expanded
- Provide accurate character indices (startIndex/endIndex)
- Summary should be 1 sentence, <100 chars
- Aim for 150-250 words in root text
- Write in plain text without markdown formatting (no **, __, [], etc.)`;

// System prompt for expanding individual terms
const EXPAND_SYSTEM_PROMPT = `You are an expert explainer providing deeper context on a specific term.

The user clicked on a term to learn more. Provide a focused explanation (2-4 sentences) that:
1. Clearly explains what the term means
2. Adds relevant context or examples
3. Identifies 2-4 related concepts that could be explored further

Return ONLY valid JSON matching this schema:
{
  "termId": "same-as-request",
  "node": {
    "id": "unique-id",
    "text": "Explanation of the term...",
    "expandableTerms": [
      {
        "id": "unique-id",
        "term": "related concept",
        "startIndex": 10,
        "endIndex": 25,
        "summary": "Brief preview"
      }
    ]
  }
}

Rules:
- Keep explanation focused and concise (50-150 words)
- Make it self-contained but respect parent context
- Include 2-4 expandable terms for deeper exploration
- Maintain accurate character indices
- Write in plain text without markdown formatting (no **, __, [], etc.)`;

export async function generateExplanation(
  request: ExplainRequest
): Promise<ExplainResponse> {
  const { topic, options = {} } = request;
  const tone = options.tone || 'balanced';

  // Tone-specific guidance
  const toneGuidance = {
    concise: 'Keep explanation brief and to the point (100-150 words). Focus on core concepts only.',
    balanced: 'Provide a clear, well-rounded explanation (150-250 words). Balance brevity with depth.',
    detailed: 'Give a comprehensive explanation with context and nuance (250-400 words). Explore implications and connections.',
  }[tone];

  const userPrompt = `Topic: "${topic}"

Style: ${tone}
${toneGuidance}

Generate a clear explanation with expandable terms. Return ONLY the JSON response.`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: EXPLAIN_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(content);
    const validated = ExplainResponseSchema.parse(parsed);

    return validated;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate explanation: ${error.message}`);
    }
    throw error;
  }
}

export async function expandTerm(
  request: ExpandRequest
): Promise<ExpandResponse> {
  const { topic, termId, term, parentContext, depth } = request;

  if (depth > 5) {
    throw new Error('Maximum expansion depth reached');
  }

  const userPrompt = `Original topic: "${topic}"
Term to expand: "${term}"
Context: "${parentContext}"
Current depth: ${depth}

Provide a focused explanation of "${term}" with 2-4 expandable sub-terms. Return ONLY the JSON response.`;

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: EXPAND_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(content);
    const validated = ExpandResponseSchema.parse(parsed);

    // Ensure termId matches request
    validated.termId = termId;

    return validated;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to expand term: ${error.message}`);
    }
    throw error;
  }
}
