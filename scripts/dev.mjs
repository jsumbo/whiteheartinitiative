// Runs the Next.js dev server and the Decap CMS local server together,
// so /admin can save straight to the files in this folder while developing.
import { spawn } from "node:child_process";

const run = (cmd, args) => spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });

const children = [run("npx", ["decap-server"]), run("npx", ["next", "dev", ...process.argv.slice(2)])];

const stop = () => children.forEach((c) => c.kill("SIGTERM"));
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
children.forEach((c) => c.on("exit", (code) => { stop(); process.exitCode = code ?? 0; }));
