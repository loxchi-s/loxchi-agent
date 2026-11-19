import { defineTool } from "eve/tools";
import { z } from "zod";

const MAX_OUTPUT_CHARS = 12_000;

const DETECT_TEST_COMMAND = `
if [ -f package.json ]; then
  if [ -f pnpm-lock.yaml ]; then pm=pnpm; elif [ -f yarn.lock ]; then pm=yarn; elif [ -f bun.lockb ] || [ -f bun.lock ]; then pm=bun; else pm=npm; fi
  if [ ! -d node_modules ]; then
    case "$pm" in
      pnpm) corepack enable >/dev/null 2>&1; pnpm install --frozen-lockfile || pnpm install ;;
      yarn) corepack enable >/dev/null 2>&1; yarn install --frozen-lockfile || yarn install ;;
      bun) bun install ;;
      *) npm ci || npm install ;;
    esac
  fi
  exec $pm test
elif [ -f Cargo.toml ]; then exec cargo test
elif [ -f go.mod ]; then exec go test ./...
elif [ -f pyproject.toml ] || [ -f pytest.ini ] || [ -f setup.py ]; then exec python3 -m pytest
elif [ -f Makefile ]; then exec make test
else echo "No test runner detected. Pass an explicit command." >&2; exit 127
fi
`;

function tail(text: string): string {
  return text.length > MAX_OUTPUT_CHARS
    ? `...[truncated ${text.length - MAX_OUTPUT_CHARS} chars]\n${text.slice(-MAX_OUTPUT_CHARS)}`
    : text;
}

export default defineTool({
  description:
    "Run a repository's test suite in the sandbox and return the exit code with the tail of stdout and stderr. Detects npm/pnpm/yarn/bun, cargo, go, pytest, or make when no command is given, and installs JavaScript dependencies first if node_modules is missing.",
  inputSchema: z.object({
    directory: z
      .string()
      .default(".")
      .describe(
        "Repository directory relative to /workspace, e.g. `repos/loxchi-agent`. Defaults to /workspace.",
      ),
    command: z
      .string()
      .optional()
      .describe(
        "Explicit test command, e.g. `pnpm test -- src/foo.test.ts`. Omit to auto-detect the runner.",
      ),
  }),
  async execute({ directory, command }, ctx) {
    if (directory.startsWith("/") || directory.split("/").includes("..")) {
      return { ok: false, exitCode: -1, stdout: "", stderr: "directory must be relative to /workspace" };
    }
    const sandbox = await ctx.getSandbox();
    const result = await sandbox.run({
      command: command ?? DETECT_TEST_COMMAND,
      workingDirectory: directory,
      env: { CI: "1", FORCE_COLOR: "0" },
    });
    return {
      ok: result.exitCode === 0,
      exitCode: result.exitCode,
      stdout: tail(result.stdout),
      stderr: tail(result.stderr),
    };
  },
});
