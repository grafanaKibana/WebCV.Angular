export interface ArticleAuthor {
  name: string;
  title: string;
  avatarUrl: string;
}

export interface ArticleHeadingBlock {
  type: 'heading';
  level: 2 | 3;
  text: string;
  anchor?: string;
}

export interface ArticleParagraphBlock {
  type: 'paragraph';
  text: string;
}

export interface ArticleListBlock {
  type: 'list';
  items: string[];
  ordered?: boolean;
}

export interface ArticleCodeBlock {
  type: 'code';
  language: string;
  code: string;
}

export interface ArticleQuoteBlock {
  type: 'quote';
  text: string;
  author?: string;
}

export type ArticleContentBlock =
  | ArticleHeadingBlock
  | ArticleParagraphBlock
  | ArticleListBlock
  | ArticleCodeBlock
  | ArticleQuoteBlock;

export interface ArticleData {
  id: number;
  headline: string;
  summary: string;
  content: ArticleContentBlock[];
  topics: string[];
  publishDate: string;
  imagePath: string;
  author: ArticleAuthor;
}

export interface ArticleModel extends Omit<ArticleData, 'publishDate'> {
  publishDate: Date;
}
