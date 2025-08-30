// logger.ts
let logToFile: (msg: string) => void;

if (typeof window === "undefined") {
  // ✅ Server-side
  const fs = require("fs");
  const path = require("path");

  const logFilePath = path.join(process.cwd(), "logs", "axios-logs.txt");
  if (!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath));
  }

  logToFile = (message: string) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`, "utf8");
  };
} else {
  // ✅ Client-side (fallback)
  logToFile = (message: string) => {
    console.log("[Client Log]", message);
    // (optional) send logs to a server API endpoint for persistence
  };
}

export { logToFile };
