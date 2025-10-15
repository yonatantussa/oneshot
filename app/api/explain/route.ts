import { NextRequest, NextResponse } from 'next/server';
import { ExplainRequestSchema } from '@/lib/schema';
import { generateExplanation } from '@/lib/llm/client';
import type { ApiError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedRequest = ExplainRequestSchema.parse(body);

    // Generate explanation
    const response = await generateExplanation(validatedRequest);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/explain:', error);

    if (error instanceof Error) {
      const apiError: ApiError = {
        error: 'Failed to generate explanation',
        details: error.message,
      };
      return NextResponse.json(apiError, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Internal server error' } as ApiError,
      { status: 500 }
    );
  }
}
