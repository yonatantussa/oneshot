import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_NAME = process.env.MODEL_NAME || 'gpt-4o-mini';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AskRequest {
  selectedText: string;
  question: string;
  conversationHistory: Message[];
}

export async function POST(request: NextRequest) {
  try {
    const body: AskRequest = await request.json();
    const { selectedText, question, conversationHistory } = body;

    // Build conversation context
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are a helpful assistant answering questions about a selected text passage.

The user has selected this text:
"${selectedText}"

Provide clear, concise answers focused on the selected text. If the question is about something not in the text, politely note that and provide general information if helpful.`,
      },
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add current question
    messages.push({
      role: 'user',
      content: question,
    });

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content || 'No response generated.';

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Error in /api/ask:', error);

    return NextResponse.json(
      { error: 'Failed to process question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
