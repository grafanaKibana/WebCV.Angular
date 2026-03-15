export interface ArticleAuthor {
  name: string;
  title: string;
  avatarUrl: string;
}

export interface ArticleData {
  id: number;
  slug: string;
  headline: string;
  content: string;
  publishDate: string;
  imagePath: string;
  author: ArticleAuthor;
}

export interface ArticleModel extends Omit<ArticleData, 'publishDate'> {
  publishDate: Date;
}
