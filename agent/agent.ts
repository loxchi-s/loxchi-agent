import { defineAgent } from "eve";

export default defineAgent({
  "model": "nvidia/nemotron-3.5-lightning-free",
  "reasoning": "medium",
  "compaction": {
    "threshold": 0.7
  }
});
