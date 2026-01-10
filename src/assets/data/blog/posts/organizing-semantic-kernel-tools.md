---
id: 2
headline: "Organizing Semantic Kernel tools and plugins without chaos"
topics:
  - Semantic Kernel
  - Architecture
  - Tools
publishDate: "2024-07-05"
imagePath: "https://picsum.photos/seed/semantic-kernel-tools/1200/630"
author:
  name: "Nikita Reshetnik"
  title: ".NET / AI Engineer"
  avatarUrl: "./assets/images/my-portrait.png"
---
Semantic Kernel is at its best when tools are easy to find, version, and test. Treat plugins as product features, not random utilities.

## Group by capability

Organize plugins by domain: customer, catalog, ops, analytics. It makes ownership and testing clear and keeps prompts focused.

## Name for intent

- Use a consistent prefix like Customer or Orders for discoverability.
- Prefer verb-based function names: GetOrderStatus, CreateTicket.
- Add descriptions that mirror UX language, not backend jargon.

## Registration example

```csharp
var builder = Kernel.CreateBuilder();

builder.Plugins.AddFromType<CustomerPlugin>("customer");
builder.Plugins.AddFromType<OrdersPlugin>("orders");

var kernel = builder.Build();
```

## Keep it testable

- Put prompt templates next to the plugin that owns them.
- Create a small contract test suite per plugin.
- Version breaking changes explicitly in your tool registry.

> When tools are tidy, prompts get simpler and reliability goes up.
