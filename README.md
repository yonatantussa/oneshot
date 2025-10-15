# oneshot

**Clear, expandable explanations on any topic.**

oneshot is a web app that explains things with inline expandable terms. Click on any term or select a concept to explore deeper.

## Features

- **Progressive Disclosure**: Start with a 60-second overview, drill down into exactly what interests you
- **On-Demand Expansion**: Terms expand on-click, loading deeper context via LLM
- **Infinite Depth**: Expansions can contain more expandable terms (up to 5 levels)
- **Beautiful UI**: Glass-morphism design with smooth animations
- **Share & Export**: Copy shareable links or download as markdown
- **Smart Options**: Control tone, include examples, use cases, and pitfalls

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **OpenAI API** (GPT-4o-mini/GPT-4o)
- **Tailwind CSS** (Glass-morphism, custom animations)
- **Framer Motion** (Smooth expansion animations)
- **Zod** (Runtime validation)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd oneshot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-...
   MODEL_NAME=gpt-4o-mini
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a topic you want to understand (e.g., "How does HTTPS work?")
2. Optionally toggle options (examples, use cases, pitfalls)
3. Click "Explain" to generate the initial explanation
4. Click any highlighted term to expand it inline
5. Continue expanding terms to explore deeper
6. Use the copy/share/download buttons to save or share

## Architecture

### On-Demand Expansion

Unlike traditional layered explanations, OneShot generates content on-demand:

- **Initial Request** (`/api/explain`): Returns a concise explanation with 5-8 expandable terms
- **Expansion Request** (`/api/expand`): When you click a term, it loads a focused explanation for that specific concept
- **Recursive**: Each expansion can contain 2-4 new expandable terms

This approach:
- Keeps initial load fast
- Allows infinite depth
- Only generates content you actually want to explore

### Components

- `app/page.tsx` - Main page with topic input
- `components/expandable/ExpandableText.tsx` - Renders text with inline expandable terms
- `components/expandable/ExpandableTerm.tsx` - Individual expandable term (handles click, loading, animation)
- `lib/llm/client.ts` - OpenAI integration
- `app/api/explain/route.ts` - Initial explanation endpoint
- `app/api/expand/route.ts` - Term expansion endpoint

### Adjust Prompt

Edit prompts in `lib/llm/client.ts`:
- `EXPLAIN_SYSTEM_PROMPT` - Controls initial explanation style
- `EXPAND_SYSTEM_PROMPT` - Controls expansion behavior

enjoy!
