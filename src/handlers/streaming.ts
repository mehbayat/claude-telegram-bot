/**
 * Shared streaming callback for Claude Telegram Bot handlers.
 *
 * Provides a reusable status callback for streaming Claude responses.
 */

import type { Context } from "grammy";
import type { Message } from "grammy/types";
import { InlineKeyboard } from "grammy";
import type { StatusCallback } from "../types";
import { convertMarkdownToHtml } from "../formatting";
import {
  TELEGRAM_MESSAGE_LIMIT,
  TELEGRAM_SAFE_LIMIT,
  BUTTON_LABEL_MAX_LENGTH,
} from "../config";

/**
 * Create inline keyboard for ask_user options.
 */
export function createAskUserKeyboard(
  requestId: string,
  options: string[]
): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  for (let idx = 0; idx < options.length; idx++) {
    const option = options[idx]!;
    // Truncate long options for button display
    const display =
      option.length > BUTTON_LABEL_MAX_LENGTH
        ? option.slice(0, BUTTON_LABEL_MAX_LENGTH) + "..."
        : option;
    const callbackData = `askuser:${requestId}:${idx}`;
    keyboard.text(display, callbackData).row();
  }
  return keyboard;
}

/**
 * Check for pending ask-user requests and send inline keyboards.
 */
export async function checkPendingAskUserRequests(
  ctx: Context,
  chatId: number
): Promise<boolean> {
  const glob = new Bun.Glob("ask-user-*.json");
  let buttonsSent = false;

  for await (const filename of glob.scan({ cwd: "/tmp", absolute: false })) {
    const filepath = `/tmp/${filename}`;
    try {
      const file = Bun.file(filepath);
      const text = await file.text();
      const data = JSON.parse(text);

      // Only process pending requests for this chat
      if (data.status !== "pending") continue;
      if (String(data.chat_id) !== String(chatId)) continue;

      const question = data.question || "Please choose:";
      const options = data.options || [];
      const requestId = data.request_id || "";

      if (options.length > 0 && requestId) {
        const keyboard = createAskUserKeyboard(requestId, options);
        await ctx.reply(`❓ ${question}`, { reply_markup: keyboard });
        buttonsSent = true;

        // Mark as sent
        data.status = "sent";
        await Bun.write(filepath, JSON.stringify(data));
      }
    } catch (error) {
      console.warn(`Failed to process ask-user file ${filepath}:`, error);
    }
  }

  return buttonsSent;
}

/**
 * Tracks state for streaming message updates.
 */
export class StreamingState {
  segments = new Map<number, string>(); // segment_id -> text content
  toolMessages: Message[] = []; // kept for compatibility with existing handlers
  typingStarted = false;
  doneSent = false;
}

function splitForTelegram(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  let current = "";

  for (const rawParagraph of paragraphs) {
    const paragraph = rawParagraph.trim();
    if (!paragraph) continue;

    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= limit) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (paragraph.length <= limit) {
      current = paragraph;
      continue;
    }

    // Fallback for long paragraphs: split by line, then by hard limit.
    for (const line of paragraph.split("\n")) {
      const lineText = line.trim();
      if (!lineText) continue;

      if (lineText.length <= limit) {
        const withLine = current ? `${current}\n${lineText}` : lineText;
        if (withLine.length <= limit) {
          current = withLine;
        } else {
          if (current) chunks.push(current);
          current = lineText;
        }
        continue;
      }

      if (current) {
        chunks.push(current);
        current = "";
      }
      for (let i = 0; i < lineText.length; i += limit) {
        chunks.push(lineText.slice(i, i + limit));
      }
    }
  }

  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text.slice(0, limit)];
}

/**
 * Create a status callback for streaming updates.
 */
export function createStatusCallback(
  ctx: Context,
  state: StreamingState
): StatusCallback {
  return async (statusType: string, content: string, segmentId?: number) => {
    try {
      if (!state.typingStarted) {
        const chatId = ctx.chat?.id;
        if (chatId !== undefined) {
          await ctx.api.sendChatAction(chatId, "typing");
          state.typingStarted = true;
        }
      }

      // Silent accumulator: skip intermediary thinking/tool status messages.
      if (statusType === "thinking" || statusType === "tool") {
        return;
      }

      if (
        (statusType === "text" || statusType === "segment_end") &&
        segmentId !== undefined
      ) {
        if (content) {
          state.segments.set(segmentId, content);
        }
        return;
      }

      if (statusType === "done" && !state.doneSent) {
        state.doneSent = true;
        const orderedText = [...state.segments.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([, value]) => value)
          .join("")
          .trim();

        if (!orderedText) return;

        const chunks = splitForTelegram(
          orderedText,
          Math.min(TELEGRAM_SAFE_LIMIT, TELEGRAM_MESSAGE_LIMIT)
        );
        for (const chunk of chunks) {
          const formatted = convertMarkdownToHtml(chunk);
          await ctx.reply(formatted, { parse_mode: "HTML" });
        }
      }
    } catch (error) {
      console.error("Status callback error:", error);
    }
  };
}
