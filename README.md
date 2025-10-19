# oneshot

**Interactive explanations with expandable terms**

oneshot explains things with inline expandable terms. Click on any term for an expanded explanation, or select a larger part of the text to ask a question.

## Features

- **Progressive Disclosure**: Start with an overview, drill down into what interests you
- **Expansion**: Terms expand when you click on them
- **Infinite Depth**: Expansions can contain more expandable terms (up to 5 levels)
- **Share & Export**: Copy shareable links or download as markdown
- **Style Options**: Adjust length of explanation

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
2. Press Enter key to generate the initial explanation
3. Click any term to expand it inline
4. Continue expanding terms to explore deeper
5. Select text to display a text box for asking questions
6. Use the copy/share/download buttons to save or share

## Architecture

### On-Demand Expansion

- **Initial Request** (`/api/explain`): Returns an explanation
- **Expansion Request** (`/api/expand`): When you click a term, it loads a focused explanation for that specific concept
- **Recursive**: Each expansion can also be expanded by clicking a term or selecting text.

### Components

- `app/page.tsx` - Main page with topic input
- `components/expandable/ExpandableText.tsx` - Renders text with inline expandable terms
- `components/expandable/ExpandableTerm.tsx` - Individual expandable term (handles click, loading, animation)
- `lib/llm/client.ts` - OAI API
- `app/api/explain/route.ts` - Initial explanation endpoint
- `app/api/expand/route.ts` - Term expansion endpoint

### Adjust Prompt

Edit prompts in `lib/llm/client.ts`:
- `EXPLAIN_SYSTEM_PROMPT` - Controls initial explanation style
- `EXPAND_SYSTEM_PROMPT` - Controls expansion behavior

enjoy!
