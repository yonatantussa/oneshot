import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Replicate from 'replicate';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import https from 'https';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const maxDuration = 300; // 5 minutes for video rendering

// Helper to download image from URL
async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

export async function POST(request: NextRequest) {
  try {
    const { topic, text } = await request.json();

    if (!text || !topic) {
      return NextResponse.json(
        { error: 'Topic and text are required' },
        { status: 400 }
      );
    }

    // Step 1: Generate video script with scenes
    const scriptPrompt = `Convert this explanation into a video script with 5-7 short scenes. Each scene should have:
1. Visual description (what to show)
2. Narration text (what to say - keep it SHORT, max 15 words)
3. Duration (4-6 seconds)

Topic: ${topic}

Explanation: ${text}

Return ONLY valid JSON in this format:
{
  "title": "${topic}",
  "scenes": [
    {
      "visual": "Description of visual/image prompt",
      "narration": "Short text to narrate",
      "duration": 5
    }
  ]
}

Keep narration VERY concise and visual descriptions clear. Make it engaging.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a video script writer. Create engaging explainer video scripts with SHORT narration.',
        },
        { role: 'user', content: scriptPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const script = JSON.parse(completion.choices[0]?.message?.content || '{}');

    // Step 2: Save script to temp file (animations generated in Remotion)
    const timestamp = Date.now();
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    const scriptPath = path.join(videosDir, `script-${timestamp}.json`);
    const outputPath = path.join(videosDir, `${timestamp}.mp4`);

    fs.writeFileSync(scriptPath, JSON.stringify(script, null, 2));

    // Step 3: Spawn Node.js process to render video
    const renderScript = path.join(process.cwd(), 'scripts', 'render-video.js');

    await new Promise((resolve, reject) => {
      const child = spawn('node', [renderScript, scriptPath, outputPath], {
        stdio: 'inherit',
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`Render process exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });

    // Clean up script file
    fs.unlinkSync(scriptPath);

    // Return video URL
    const videoUrl = `/videos/${path.basename(outputPath)}`;

    return NextResponse.json({
      videoUrl,
      script,
    });
  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
