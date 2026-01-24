---
id: 3
headline: "Quick intro to Microsoft.Extensions.AI.Evaluating"
topics:
  - AI
  - Evaluation
  - Azure DevOps
publishDate: "2024-07-06"
imagePath: "hero.png"
author:
  name: "Nikita Reshetnik"
  title: ".NET / AI Engineer"
  avatarUrl: "./assets/images/my-portrait.png"
---
Microsoft.Extensions.AI.Evaluating helps you measure prompt quality like any other test suite. Start with a few scenarios, add evaluators, and publish results to your CI pipeline.

## Evaluate prompts with scenarios

- Define a small dataset of inputs and expected traits.
- Run evaluations in CI so regressions are visible.
- Track scores over time to see drift early.

## Create custom evaluators

Custom evaluators let you encode product rules like tone, format, or compliance. Start simple with pass or fail and add richer scoring later. The snippet below is pseudo-code you can map to your evaluator API.

```csharp
// Pseudo-code: adapt to your evaluator API
var suite = new EvaluationSuite()
  .AddScenario("Tone", input, expected)
  .AddEvaluator(new ToneEvaluator());

var results = await suite.RunAsync(model);
```

## Export results to Azure DevOps

- Emit results as TRX or JUnit XML for Azure DevOps test reporting.
- Publish JSON summaries as pipeline artifacts for dashboards.
- Fail the build on critical evaluator thresholds.

> If you can evaluate it, you can improve it.
