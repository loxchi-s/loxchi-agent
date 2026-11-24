import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { defineAgent } from "eve";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default defineAgent({
  "model": openrouter("baidu/ernie-5.5-flash-preview:free"),
  "reasoning": "medium",
  "compaction": {
    "threshold": 0.7
  }
});
