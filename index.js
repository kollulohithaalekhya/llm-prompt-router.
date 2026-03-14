#!/usr/bin/env node

require("dotenv").config();
const readline = require("readline");
const { classify_intent, route_and_respond } = require("./router");

const DIVIDER = "------------------------------------------------------------";

async function handleMessage(message) {

if (!message.trim()) return;

console.log("\n" + DIVIDER);
console.log("You: " + message);
console.log(DIVIDER);

console.log("Classifying intent...");

const intentObj = await classify_intent(message);

console.log(
"Intent: " +
intentObj.intent.toUpperCase() +
" (confidence: " +
intentObj.confidence +
")"
);

if (intentObj.overridden) {
console.log("Manual override applied");
}

console.log("Generating response...\n");

const response = await route_and_respond(message, intentObj);

console.log("Response:\n" + response);
console.log("\n" + DIVIDER + "\n");
}

async function interactiveMode() {

console.log("\n==============================================");
console.log("LLM Prompt Router — Intent Classifier");
console.log("==============================================");

console.log("Type your message and press Enter.");
console.log("Prefix with @code, @data, @writing, or @career to override.");
console.log('Type "exit" to quit.\n');

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout,
prompt: "You > "
});

rl.prompt();

rl.on("line", async (line) => {

const input = line.trim();

if (input.toLowerCase() === "exit") {
  console.log("Goodbye!");
  rl.close();
  process.exit(0);
}

try {
  await handleMessage(input);
} catch (err) {
  console.error("Error:", err.message);
}

rl.prompt();

});

rl.on("close", () => process.exit(0));
}

(async () => {

if (!process.env.GROQ_API_KEY) {
console.error("GROQ_API_KEY is not set in .env");
process.exit(1);
}

const args = process.argv.slice(2);

if (args.length > 0) {
try {
  await handleMessage(args.join(" "));
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
} else {
await interactiveMode();
}

})();
