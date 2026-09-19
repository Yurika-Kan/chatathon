const { execFile } = require("child_process");

function runMonid(args) {
  return new Promise((resolve, reject) => {
    execFile("monid", args, { timeout: 120000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve(stdout);
      }
    });
  });
}

async function runEndpoint(provider, endpoint, { body, query, path } = {}) {
  const args = ["run", "-p", provider, "-e", endpoint, "-w", "--json"];
  if (body) args.push("-i", JSON.stringify(body));
  if (query) args.push("--query", JSON.stringify(query));
  if (path) args.push("--path", JSON.stringify(path));
  return runMonid(args);
}

module.exports = { runEndpoint };
