/**

* logger.js
* Appends each route event as a JSON line to route_log.jsonl
  */

const fs = require("fs");
const path = require("path");

const LOG_FILE = path.join(__dirname, "route_log.jsonl");

/**

* Append a log entry to the JSONL file
  */
  async function logRoute(entry) {
  const line = JSON.stringify(entry) + "\n";

try {
fs.appendFileSync(LOG_FILE, line, "utf8");
} catch (err) {
console.error("[Logger] Failed to write log:", err.message);
}
}

/**

* Read all logs from route_log.jsonl
  */
  function readLogs() {
  if (!fs.existsSync(LOG_FILE)) {
  return [];
  }

const content = fs.readFileSync(LOG_FILE, "utf8").trim();

if (!content) {
return [];
}

return content
.split("\n")
.filter(Boolean)
.map((line) => JSON.parse(line));
}

module.exports = { logRoute, readLogs };
