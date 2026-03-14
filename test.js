/**
 * test.js
 * Runs all 15 required test messages through the router
 * and prints a summary table with intent + confidence.
 *
 * Usage: node test.js
 */

require("dotenv").config();

const { classify_intent, route_and_respond } = require("./router");

const TEST_MESSAGES = [
  "how do i sort a list of objects in python?",
  "explain this sql query for me",
  "This paragraph sounds awkward, can you help me fix it?",
  "I'm preparing for a job interview, any tips?",
  "what's the average of these numbers: 12, 45, 23, 67, 34",
  "Help me make this better.",
  "I need to write a function that takes a user id and returns their profile, but also i need help with my resume.",
  "hey",
  "Can you write me a poem about clouds?",
  "Rewrite this sentence to be more professional.",
  "I'm not sure what to do with my career.",
  "what is a pivot table",
  "fxi thsi bug pls: for i in range(10) print(i)",
  "How do I structure a cover letter?",
  "My boss says my writing is too verbose."
];

const DIVIDER = "─".repeat(70);

async function runTests() {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set.");
    process.exit(1);
  }

  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║          LLM Prompt Router — Full Test Suite (15 messages)      ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const results = [];

  for (let i = 0; i < TEST_MESSAGES.length; i++) {
    const msg = TEST_MESSAGES[i];

    console.log(`\n[Test ${i + 1}/15] ${DIVIDER}`);
    console.log(`Message: "${msg}"`);

    try {
      const intentObj = await classify_intent(msg);

      console.log(
        `Intent: ${intentObj.intent.toUpperCase().padEnd(10)} | Confidence: ${intentObj.confidence}`
      );

      const response = await route_and_respond(msg, intentObj);

      const preview = response.replace(/\n/g, " ").slice(0, 120);

      console.log(
        `Response preview: ${preview}${response.length > 120 ? "..." : ""}`
      );

      results.push({
        test: i + 1,
        message: msg.slice(0, 50) + (msg.length > 50 ? "…" : ""),
        intent: intentObj.intent,
        confidence: intentObj.confidence,
        status: "PASS"
      });
    } catch (err) {
      console.error(`Error: ${err.message}`);

      results.push({
        test: i + 1,
        message: msg.slice(0, 50),
        intent: "ERROR",
        confidence: 0,
        status: "FAIL"
      });
    }

    // Small delay between tests
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n\n${"═".repeat(70)}`);
  console.log("SUMMARY");
  console.log("═".repeat(70));

  console.log(
    `${"#".padEnd(4)} ${"Intent".padEnd(10)} ${"Conf".padEnd(6)} ${"Status".padEnd(8)} Message`
  );

  console.log("─".repeat(70));

  results.forEach((r) => {
    console.log(
      `${String(r.test).padEnd(4)} ${r.intent.padEnd(10)} ${String(r.confidence).padEnd(6)} ${r.status.padEnd(8)} ${r.message}`
    );
  });

  console.log("═".repeat(70));

  const passed = results.filter(r => r.status === "PASS").length;

  console.log(`\n${passed}/${TEST_MESSAGES.length} tests passed\n`);
}

runTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
