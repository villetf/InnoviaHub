const fs = require("fs");
const path = require("path");
require("dotenv").config(); //Läser env om den finns

//Fallback
const DEFAULT_API = "http://localhost:5184";
const DEFAULT_HUB = "ws://localhost:5184/hubs/bookings";

//Läser värden från env
const apiUrl = process.env.NG_APP_API_URL || DEFAULT_API;
const hubUrl = process.env.NG_APP_HUB_URL || DEFAULT_HUB;

const outFile = path.resolve(__dirname, "../src/assets/env.js");
const content = `window.__env = {
NG_APP_API_URL: '${apiUrl}',
NG_APP_HUB_URL: '${hubUrl}'
};\n`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, content, "utf8");
console.log("[env] Wrote", outFile, "with:", { apiUrl, hubUrl });

