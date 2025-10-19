import { NextRequest, NextResponse } from 'next/server';
import { ExpandRequestSchema } from '@/lib/schema';
import { expandTerm } from '@/lib/llm/client';
import type { ApiError } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validatedRequest = ExpandRequestSchema.parse(body);

    // Expand term
    const response = await expandTerm(validatedRequest);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/expand:', error);

    if (error instanceof Error) {
      const apiError: ApiError = {
        error: 'Failed to expand term',
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
