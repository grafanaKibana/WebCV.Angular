---
id: 1
headline: "Prompting with a human-in-the-loop: Figma, Chrome DevTools, and MCPs"
topics:
  - Prompting
  - UX
  - MCP
  - Testing
publishDate: "2024-07-03"
imagePath: "https://picsum.photos/seed/prompting-loop/1200/630"
author:
  name: "Nikita Reshetnik"
  title: ".NET / AI Engineer"
  avatarUrl: "./assets/images/my-portrait.png"
---
Great prompts are not written once. They are iterated in a tight loop with humans validating intent, UX, and edge cases before users ever see the output.

## The loop: draft, test, refine

- Draft the prompt from the Figma flow so the model mirrors the user journey.
- Test in the app with Chrome DevTools and MCPs to capture real DOM state and inputs.
- Refine with human review: clarity, tone, and failure modes before automation.

## Use Figma for intent

Start with the exact copy and micro-interactions from Figma. It prevents prompt drift and keeps UI behavior aligned with the design system.

## Chrome DevTools MCPs for reality checks

MCPs let you feed the model real runtime context: DOM nodes, network responses, and layout changes. It is the fastest way to validate that prompts behave in the actual UI.

- Capture live DOM snapshots to verify selectors and labels.
- Record edge states (empty lists, errors, latency) to harden prompts.
- Replay results with human approval before shipping.

> A good prompt is a tested UX decision, not a clever sentence.
