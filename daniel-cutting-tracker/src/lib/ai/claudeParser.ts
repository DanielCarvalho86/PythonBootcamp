import Anthropic from "@anthropic-ai/sdk";
import type { ParsedMessage } from "@/types/domain";
import { parsedMessageSchema } from "@/lib/validation/aiSchemas";

/**
 * Claude-backed parser. Its ONLY job is turning natural language into the
 * structured shape defined by `parsedMessageSchema` — it must never
 * attempt nutrition arithmetic itself (spec section 2/30). The response is
 * always validated against the Zod schema before it's trusted; a response
 * that fails validation is treated the same as an API failure by the
 * caller (src/lib/ai/index.ts), which falls back to the rule-based parser.
 */

const SYSTEM_PROMPT = `Você é um extrator de dados estruturados para um app de acompanhamento nutricional.
Sua ÚNICA tarefa é transformar uma mensagem em português (comida, atividade física, peso, água) em um objeto JSON.
Você NUNCA calcula calorias, macros ou qualquer valor nutricional — apenas extrai o que a pessoa escreveu.

Responda APENAS com um JSON válido (sem markdown, sem comentários) no seguinte formato:
{
  "date": "YYYY-MM-DD",
  "meals": [
    { "mealType": "breakfast|morning_snack|lunch|afternoon_snack|dinner|supper|other",
      "items": [ { "food": "string", "quantity": number, "unit": "g|ml|unit|slice|tbsp|cup" } ] }
  ],
  "activities": [
    { "activityType": "steps|weight_training|swimming|walking|running|cycling|cardio|sports|other",
      "durationMinutes": number, "caloriesBurned": number, "caloriesSource": "user|device|estimated",
      "description": "string" }
  ],
  "steps": number,
  "stepsCalories": number,
  "weight": { "weightKg": number },
  "waterMl": number,
  "needsClarification": "string (only if something in the message is ambiguous and you could not extract it confidently)"
}

Omita campos que não se aplicam à mensagem. Nunca invente quantidades ou alimentos que não foram mencionados.
Se uma quantidade não for clara (ex: "comi um sanduíche" sem detalhes), coloque o item mesmo assim com sua melhor estimativa de "unit" e explique em needsClarification.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function parseMessageWithClaude(message: string, today: string): Promise<ParsedMessage> {
  const anthropic = getClient();
  const model = process.env.ANTHROPIC_PARSER_MODEL || "claude-haiku-4-5-20251001";

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}\n\nData de hoje: ${today}`,
    messages: [{ role: "user", content: message }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude response contained no text block");
  }

  const jsonText = extractJson(textBlock.text);
  const parsed = JSON.parse(jsonText);
  return parsedMessageSchema.parse(parsed);
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in Claude response");
  return text.slice(start, end + 1);
}
