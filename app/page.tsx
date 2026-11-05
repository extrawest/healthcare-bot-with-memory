"use client";

import { Loader2 } from "lucide-react";
import { useState, type SubmitEvent } from "react";
import Markdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [memoryWarning, setMemoryWarning] = useState("");

  async function sendMessage(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();
    if (!message || loading) return;

    setLoading(true);
    setError("");
    setMemoryWarning("");
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to send your message.");
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The server returned an invalid reply.");
      }

      setMessages((previous) => [
        ...previous,
        { role: "user", content: message },
        { role: "assistant", content: data.reply },
      ]);

      setInput("");

      if (data.memoryStatus === "failed") {
        setMemoryWarning(
          "The reply succeeded, but memory processing failed. This message may not be remembered.",
        );
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-8 px-5 py-8 font-sans text-neutral-900">
      <section
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-busy={loading}
        className="flex-1 space-y-6"
      >
        {messages.map((message, index) => (
          <article className="text-neutral-400" key={index}>
            <p className="mb-1 text-xs text-neutral-200">
              {message.role === "user" ? "You" : "Assistant"}
            </p>
            <Markdown>{message.content}</Markdown>
          </article>
        ))}

        {loading && (
          <p role="status" className="text-sm text-neutral-500">
            <Loader2 className="animate-spin" />
          </p>
        )}
      </section>

      <div className="space-y-3">
        {error && (
          <p role="alert" className="text-sm">
            Error: {error}
          </p>
        )}

        {memoryWarning && (
          <p role="status" className="text-sm text-neutral-600">
            {memoryWarning}
          </p>
        )}

        <form onSubmit={sendMessage} className="flex gap-2">
          <label htmlFor="message" className="sr-only">
            Message
          </label>
          <input
            id="message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Message"
            maxLength={4000}
            disabled={loading}
            autoComplete="off"
            className="min-w-0 flex-1 border border-neutral-700 placeholder-gray-500 px-3 py-2 text-sm focus:outline-none text-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-neutral-900 px-4 py-2 text-sm text-white focus:outline-none disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
