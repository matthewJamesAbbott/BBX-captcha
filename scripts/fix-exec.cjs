// scripts/fix-exec.cjs
const fs = require("fs");
const path = require("path");

function chmodSafe(p) {
  try {
    if (fs.existsSync(p)) {
      fs.chmodSync(p, 0o755);
      console.log("chmod +x", p);
    }
  } catch (e) {
    console.log("skip", p, e.message);
  }
}

const esbuildBin = path.join(process.cwd(), "node_modules", "@esbuild", "linux-x64", "bin", "esbuild");
chmodSafe(esbuildBin);

const viteBin = path.join(process.cwd(), "node_modules", "vite", "bin", "vite.js");
chmodSafe(viteBin);
