const Groq = require("groq-sdk");
const prompts = require("./prompts.json");
const { logRoute } = require("./logger");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const CONFIDENCE_THRESHOLD = 0.7;
const VALID_INTENTS = ["code", "data", "writing", "career", "unclear"];

/**
 * Step 1: Classify user intent
 */
async function classify_intent(message) {
  const overrideMatch = message.match(/^@(code|data|writing|career)\s+/i);

  if (overrideMatch) {
    const intent = overrideMatch[1].toLowerCase();
    console.log("[Router] Manual override detected → intent:", intent);
    return { intent, confidence: 1.0, overridden: true };
  }

  const classifierPrompt = `
Classify the user intent.

Possible labels:
code
data
writing
career
unclear

Return ONLY JSON like:
{"intent":"code","confidence":0.9}

User message: ${message}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: classifierPrompt }]
    });

    const raw = completion.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.log("[Router] Invalid JSON returned:", raw);
      return { intent: "unclear", confidence: 0.0 };
    }

    if (!VALID_INTENTS.includes(parsed.intent)) {
      parsed.intent = "unclear";
    }

    if (parsed.confidence < CONFIDENCE_THRESHOLD) {
      parsed.intent = "unclear";
    }

    return {
      intent: parsed.intent,
      confidence: Number(parsed.confidence.toFixed(2))
    };
  } catch (err) {
    console.error("[Router] classify_intent error:", err.message);
    return { intent: "unclear", confidence: 0.0 };
  }
}

/**
 * Step 2: Route to correct persona
 */
async function route_and_respond(message, intentObj) {
  const cleanMessage = message.replace(/^@(code|data|writing|career)\s+/i, "").trim();
  const { intent, confidence } = intentObj;

  const persona = prompts[intent] || prompts["unclear"];
  if (!persona) {
    console.warn("[Router] Persona missing for intent:", intent);
  }

  console.log("[Router] Routing to:", persona.label, "(confidence:", confidence + ")");

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // updated supported model
      messages: [
        { role: "system", content: persona.system },
        { role: "user", content: cleanMessage }
      ]
    });

    const finalResponse = completion.choices[0].message.content.trim();

    await logRoute({
      timestamp: new Date().toISOString(),
      intent,
      confidence,
      persona: persona.label,
      message: cleanMessage,
      response: finalResponse
    });

    return finalResponse;
  } catch (err) {
    console.error("[Router] route_and_respond error:", err.message);
    throw err;
  }
}

module.exports = { classify_intent, route_and_respond };
