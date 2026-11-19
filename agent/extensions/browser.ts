import browser from "@eve/agent-browser";

export default browser({
  contentBoundaries: true,
  // Chromium is installed into the sandbox snapshot by agent/sandbox.ts.
  autoInstall: false,
});
