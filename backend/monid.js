const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const MONID_BIN = path.resolve(__dirname, "node_modules", ".bin", "monid");
const MONID_CONFIG_DIR = path.join(os.homedir(), ".config", "monid");

function ensureCredentials() {
  const key = process.env.MONID_KEY;
  if (!key) return;

  const credsPath = path.join(MONID_CONFIG_DIR, "credentials.yaml");
  if (fs.existsSync(credsPath)) return;

  fs.mkdirSync(MONID_CONFIG_DIR, { recursive: true });
  fs.writeFileSync(credsPath, `keys:\n  main:\n    key: ${key}\n    prefix: monid_live\n    added_at: ${new Date().toISOString()}\n`, { mode: 0o600 });
  fs.writeFileSync(path.join(MONID_CONFIG_DIR, "config.yaml"), `version: 0.1.7\nactive_key: main\n`);
}

function runMonid(args) {
  ensureCredentials();
  return new Promise((resolve, reject) => {
    execFile(MONID_BIN, args, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`monid failed: ${stderr || err.message} | stdout: ${stdout}`));
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve(stdout);
      }
    });
  });
}

async function runEndpoint(provider, endpoint, { body, query, path: pathParams } = {}) {
  const args = ["run", "-p", provider, "-e", endpoint, "-w", "--json"];
  if (body) args.push("-i", JSON.stringify(body));
  if (query) args.push("--query", JSON.stringify(query));
  if (pathParams) args.push("--path", JSON.stringify(pathParams));
  return runMonid(args);
}

module.exports = { runEndpoint };
