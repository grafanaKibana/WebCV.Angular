import { Component, OnInit } from '@angular/core';
import { ArticleModel } from '../interfaces/articleModel';

@Component({
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.scss']
})
export class BlogPageComponent implements OnInit {
  articles: Array<ArticleModel> = [
    {
      id: 1,
      headline: "ASP.NET Identity and how to create authentication and authorization with it",
      summary: "Users can create an account with the login information stored in Identity or they can use an external login provider. Supported external login providers include Facebook, Google, Microsoft Account, and Twitter.\n" +
        "For information on how to globally require all users to be authenticated, see Require authenticated users.",
      content: "Some text",
      topics: [".NET", "ASP.NET Core Identity", "Authentication", "Authorization"],
      publishDate: new Date("2022-01-17"),
      imagePath: ""
    },
    {
      id: 2,
      headline: "How to design dbContext",
      summary: "This article will show you easy and fast example how to design your code-first dbContext in Entity Framework CoreThis article will show you easy and fast example how to desing yout code-first dbContext in Entity Framework CoreThis article will show you easy and fast example how to desing yout code-first dbContext in Entity Framework CoreThis article will show you easy and fast example how to desing yout code-first dbContext in Entity Framework CoreThis article will show you easy and fast example how to desing yout code-first dbContext in Entity Framework CoreThis article will show you easy and fast example how to desing yout code-first dbContext in Entity Framework CoreThis article will show you easy and fast example how to desing yout code-first dbContext in Entity Framework CoreThis article will show you easy and fast example how to desing yout code-first dbContext in Entity Framework Core",
      content: "Some text",
      topics: [".NET", "Entity Framework Core"],
      publishDate: new Date("2022-02-02"),
      imagePath: ""
    },

  ].sort((articleA, articleB) => articleB.publishDate.getTime() - articleA.publishDate.getTime())

  constructor() { }

  ngOnInit(): void { }
}
