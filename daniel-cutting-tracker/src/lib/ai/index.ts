import type { ParsedMessage } from "@/types/domain";
import { parseMessageRuleBased } from "@/lib/ai/ruleBasedParser";
import { parsedMessageSchema } from "@/lib/validation/aiSchemas";

export { parseMessageRuleBased } from "@/lib/ai/ruleBasedParser";

/**
 * Entry point used by the rest of the app. Uses the Claude-backed parser
 * when ANTHROPIC_API_KEY is configured, otherwise (and on any failure —
 * network error, malformed JSON, schema validation failure) falls back to
 * the deterministic rule-based parser so the app degrades gracefully
 * instead of failing to log anything.
 */
export async function parseUserMessage(message: string, today: string): Promise<ParsedMessage> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { parseMessageWithClaude } = await import("@/lib/ai/claudeParser");
      const result = await parseMessageWithClaude(message, today);
      return parsedMessageSchema.parse(result);
    } catch {
      // Fall through to the deterministic parser below.
    }
  }
  return parseMessageRuleBased(message, { today });
}
