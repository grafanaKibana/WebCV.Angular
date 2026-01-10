---
id: 4
headline: "Markdown feature showcase"
summary: "A comprehensive post to validate full Markdown rendering and styling."
topics:
  - Markdown
  - Testing
  - Styling
publishDate: "2024-07-08"
imagePath: "https://picsum.photos/seed/markdown-showcase/1200/630"
author:
  name: "Nikita Reshetnik"
  title: ".NET / AI Engineer"
  avatarUrl: "./assets/images/my-portrait.png"
---
This post exercises **bold**, *italic*, ***bold italic***, `inline code`, ~~strikethrough~~, and links like [Markdown Guide](https://www.markdownguide.org/) plus autolinks such as https://angular.dev/.

---

# Headings

## Heading level 2

### Heading level 3

#### Heading level 4

##### Heading level 5

###### Heading level 6

## Lists

- Unordered item A
- Unordered item B
  - Nested unordered item B.1
  - Nested unordered item B.2
- Unordered item C

1. Ordered item 1
2. Ordered item 2
   1. Nested ordered item 2.1
   2. Nested ordered item 2.2
3. Ordered item 3

## Task list

- [x] Completed task
- [ ] Pending task

## Blockquote

> A simple blockquote to test styling.
>
> - It can include lists
> - And multiple lines

## Code blocks

```ts
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

```json
{
  "name": "Markdown",
  "features": ["tables", "images", "links"],
  "enabled": true
}
```

## Table

| Feature | Supported | Notes |
| --- | :---: | --- |
| Tables | Yes | GFM tables should render | 
| Inline code | Yes | `code` looks like a chip |
| Links | Yes | Hover to underline |

## Image

![Sample image](https://picsum.photos/seed/markdown-image/900/420 "Markdown image")

## Inline HTML

<details>
  <summary>Expandable details (HTML)</summary>
  <p>This uses inline HTML to ensure it renders inside the Markdown body.</p>
</details>

## Horizontal rule

---

## Escapes and characters

Use a backslash to escape special characters like \* or \#.
