import { installAgentBrowser } from "@eve/agent-browser/sandbox";
import { installCodeTooling } from "eve/extensions/code/sandbox";
import { defineSandbox } from "eve/sandbox";
import { VercelSandbox } from "eve/sandbox/vercel";

// Vercel Sandbox provides the mutable network policy that keeps GitHub
// credentials at the firewall instead of inside the sandbox.
export const environment = VercelSandbox.environment({
  prepare: async (sandbox) => {
    await installCodeTooling(sandbox);
    await installAgentBrowser(sandbox);
    const result = await sandbox.run({ command: "mkdir -p /workspace/repos" });
    if (result.exitCode !== 0) throw new Error(result.stderr);
  },
});

export default defineSandbox(() => environment.open());
