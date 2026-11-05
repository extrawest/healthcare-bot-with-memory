# Healthcare Chatbot with Long-Term Memory

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A healthcare education chatbot built with Next.js, TypeScript, LangChain, Gemini, and Mem0.

The chatbot extracts relevant facts from user messages, stores them in Qdrant Cloud, and retrieves them to personalize future responses. Embeddings are generated remotely through Google's OpenAI-compatible API using `gemini-embedding-2` with 768 dimensions.

> **Demo only.** Use fictional information. This application does not provide diagnoses, prescriptions, or emergency care. Do not submit real patient information or other sensitive personal data.

## Demo

- **Deployed application:** Not published yet.
- **Demo video:** [Watch the chatbot demonstration](./demo.mov)

## Key Features

- **Long-term memory:** Mem0 extracts useful facts from user messages and stores them in Qdrant Cloud.
- **Personalized responses:** Relevant memories are included in the context sent to Gemini.
- **Gemini via Google AI Studio:** Used for both chat responses and Mem0's memory extraction.
- **OpenAI-compatible embeddings:** Google's embedding endpoint produces 768-dimensional vectors without requiring an OpenAI account.
- **Anonymous browser sessions:** An HTTP-only cookie identifies the visitor's memory scope.
- **Minimal chat interface:** Markdown responses, loading indicators, and error messages.
- **Memory-processing feedback:** The UI warns when a reply succeeds but memory processing fails.
- **Cloud-based services:** No local database or locally hosted AI model is required.

## Tech Stack

| Component                      | Technology                                |
| ------------------------------ | ----------------------------------------- |
| Application                    | Next.js 16, React 19, TypeScript          |
| Styling                        | Tailwind CSS 4                            |
| LLM integration                | LangChain.js — `@langchain/google`        |
| Chat and memory-extraction LLM | Gemini, configured through `GEMINI_MODEL` |
| Memory layer                   | Mem0 OSS — `mem0ai/oss`                   |
| Vector database                | Qdrant Cloud                              |
| Embedding model                | `gemini-embedding-2`                      |
| Embedding dimensions           | 768                                       |
| Embedding API                  | Google's OpenAI-compatible endpoint       |
| Response rendering             | React Markdown                            |

## How It Works

1. The browser sends a message to `POST /api/chat`.
2. The server identifies the visitor through an anonymous session cookie.
3. Mem0 embeds the message and searches the visitor's memories in Qdrant.
4. LangChain sends the current message and relevant memories to Gemini.
5. Gemini generates a response.
6. Mem0 processes the user's message and stores relevant facts in Qdrant.
7. The server returns the response and memory-processing status.

Only user statements are submitted for memory extraction; generated assistant replies are not saved as user facts.

## Prerequisites

- **Node.js 24** and npm.
- A Google AI Studio API key with access to:
  - A Gemini chat model.
  - `gemini-embedding-2`.
- A Qdrant Cloud cluster and database API key.

The application uses Mem0 OSS inside the Next.js server. A Mem0 Platform API key is not required by this implementation.

### Dependency Compatibility

The project pins these versions for compatibility with Mem0:

- `@google/genai`: `1.52.0`
- `@qdrant/js-client-rest`: `1.18.0`

Qdrant client 1.18.0 exposes the `search()` method used by Mem0's adapter. This client has a known HTTP dispatcher incompatibility with Node.js 26, so use Node.js 24.

## Setup

### 1. Install dependencies

From the repository root:

```sh
npm ci
```

### 2. Configure environment variables

Create an ignored `.env` file in the repository root:

```dotenv
GOOGLE_API_KEY=your-google-ai-studio-api-key
GEMINI_MODEL=your-available-gemini-chat-model-id

QDRANT_URL=https://your-cluster.cloud.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-database-api-key

MEM0_TELEMETRY=false
```

Use the exact HTTPS cluster URL supplied by Qdrant Cloud.

`GEMINI_MODEL` must identify a chat model, not the embedding model. The embedding model and its dimensions are configured separately in `lib/memory.ts`.

Never commit API keys or prefix them with `NEXT_PUBLIC_`.

For a cloud development environment or deployment, configure these values through the platform's server-side environment-variable settings instead.

### 3. Start the application

```sh
npm run dev
```

Open the address printed by Next.js, normally:

```text
http://localhost:3000
```

Only the application runs in the development environment. Gemini inference, embedding generation, and persistent memory storage use remote services.

### 4. Production build

```sh
npm run build
npm start
```

### 5. Code checks

```sh
npm run lint
npx tsc --noEmit
```

## Try the Memory Flow

Use fictional details:

1. Send: “For this fictional demo, I prefer morning appointments.”
2. Wait for the response and check that no memory-processing warning appears.
3. Refresh the page without clearing browser cookies.
4. Ask: “What time of day do I prefer appointments?”

The visible conversation resets on refresh. The next response can use facts retrieved from Qdrant rather than relying on the previous messages being displayed.

Memory extraction is model-dependent: not every message creates a new memory.

## Project Structure

```text
app/
  api/chat/route.ts   Chat endpoint and memory integration
  page.tsx           Chat interface
  layout.tsx         Application layout
  globals.css        Global styles
lib/
  memory.ts          Mem0, Gemini embeddings, and Qdrant configuration
```

## Deployment

Deploy to a platform that supports Next.js server-side route handlers.

1. Use Node.js 24.
2. Install dependencies with `npm ci`.
3. Configure the server-side environment variables.
4. Build with `npm run build`.
5. Use the platform's Next.js runtime or start the application with `npm start`.
6. Confirm the runtime can connect to Google and Qdrant Cloud.

No database container or local model server is required.

Free-tier availability, quotas, and hosting eligibility depend on the selected providers and account. Do not enable paid billing if you need to remain within free-tier usage.

## Privacy and Limitations

- **Fictional data only:** This is not a production healthcare system.
- **External processing:** Messages are sent to Google; extracted memories are stored in Qdrant Cloud.
- **Free-tier data handling:** Google's free-tier terms may permit submitted content to be used to improve its products.
- **Anonymous identity:** The session cookie is an access token, not an authenticated user account. Losing it loses access to that browser's memory scope; it does not delete the stored memories.
- **No memory-deletion UI:** Clearing browser data does not remove memories from Qdrant.
- **Local history disabled:** Mem0 is configured with `disableHistory: true`; Qdrant is the configured persistent memory store.
- **Limited conversation context:** The current endpoint sends the latest message and retrieved memories, not the full recent conversation.
- **Non-streaming responses:** The current endpoint returns the completed response as JSON.
- **Public-demo protection:** Authentication, abuse controls, and rate limiting are needed before unrestricted public use.
- **Not medical advice:** Responses may be inaccurate. Seek qualified professional care for medical concerns and emergency services for urgent situations.

## References

- [Mem0 overview](https://docs.mem0.ai/overview)
- [Mem0 Node SDK](https://docs.mem0.ai/open-source/node-quickstart)
- [Mem0 configuration](https://docs.mem0.ai/open-source/configuration)
- [LangChain Google integration](https://docs.langchain.com/oss/javascript/integrations/chat/google)
- [Google OpenAI-compatible embeddings](https://ai.google.dev/gemini-api/docs/openai#embeddings)
- [Google embeddings documentation](https://ai.google.dev/gemini-api/docs/embeddings)
- [Qdrant Cloud quickstart](https://qdrant.tech/documentation/cloud-quickstart/)

## Contributing

Issues and pull requests are welcome. Keep examples and test conversations free of real personal or medical information.

## License

Licensed under the [Apache License, Version 2.0](LICENSE).

Copyright 2026 Extrawest

Developed by [Extrawest](https://extrawest.com/).
