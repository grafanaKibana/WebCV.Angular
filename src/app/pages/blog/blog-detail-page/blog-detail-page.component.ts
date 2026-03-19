import { DatePipe, isPlatformBrowser } from "@angular/common";
import {
	type AfterViewChecked,
	ChangeDetectionStrategy,
	Component,
	computed,
	DestroyRef,
	DOCUMENT,
	type ElementRef,
	inject,
	type OnDestroy,
	PLATFORM_ID,
	signal,
	viewChild,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { DomSanitizer, type SafeHtml } from "@angular/platform-browser";
import { ActivatedRoute, RouterLink } from "@angular/router";
import hljs from "highlight.js/lib/common";
import { marked } from "marked";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";
import { HomeDataService } from "../../../services/home-data.service";
import { CopyButtonComponent } from "../../../shared/components/copy-button/copy-button.component";
import { slugify } from "../../../shared/utils/slugify";
import type { ArticleModel } from "../interfaces/articleModel";
import { BlogDataService } from "../services/blog-data.service";

interface TocItem {
	id: string;
	text: string;
	level: 1 | 2 | 3 | 4 | 5 | 6;
}

interface ShareLink {
	label: string;
	url: string;
	iconClass: string;
}

@Component({
	selector: "app-blog-detail-page",
	imports: [RouterLink, CopyButtonComponent, DatePipe],
	templateUrl: "./blog-detail-page.component.html",
	styleUrls: ["./blog-detail-page.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetailPageComponent implements AfterViewChecked, OnDestroy {
	readonly contentBodyRef = viewChild<ElementRef<HTMLElement>>("contentBody");
	readonly article = signal<ArticleModel | undefined>(undefined);
	readonly articleLoaded = signal(false);
	readonly contentHtml = signal<SafeHtml | null>(null);
	readonly tocItems = signal<TocItem[]>([]);
	readonly readingTimeMinutes = signal(0);
	readonly shareLinks = signal<ShareLink[]>([]);
	readonly currentUrl = signal("");
	readonly authorName = computed(() => {
		const info = this.sidebarInfo();
		return info ? `${info.firstName} ${info.lastName}` : "";
	});
	readonly authorTitle = computed(
		() => this.sidebarInfo()?.positionTitle ?? "",
	);
	authorAvatarUrl = "assets/images/my-portrait.png";

	private copyButtonsInitialized = false;
	private readonly copyButtonHandlers = new Map<HTMLButtonElement, (e: Event) => void>();
	private readonly feedbackTimeoutIds = new Set<ReturnType<typeof setTimeout>>();
	private readonly route = inject(ActivatedRoute);
	private readonly blogDataService = inject(BlogDataService);
	private readonly homeDataService = inject(HomeDataService);
	private readonly destroyRef = inject(DestroyRef);
	private readonly sanitizer = inject(DomSanitizer);
	private readonly document = inject(DOCUMENT);
	private readonly platformId = inject(PLATFORM_ID);
	private readonly sidebarInfo = toSignal(
		this.homeDataService.getSidebarInfo(),
	);

	constructor() {
		this.route.paramMap
			.pipe(
				switchMap((params) =>
					this.blogDataService.getArticleBySlug(params.get("slug") ?? ""),
				),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe((article) => {
				this.articleLoaded.set(true);
				this.article.set(article);

				if (!article) {
					this.contentHtml.set(null);
					this.tocItems.set([]);
					this.readingTimeMinutes.set(0);
					this.shareLinks.set([]);
					this.currentUrl.set("");
					return;
				}

				this.copyButtonsInitialized = false;
				this.renderMarkdown(article.content);
				this.currentUrl.set(
					isPlatformBrowser(this.platformId) ? this.document.location.href : "",
				);
				this.shareLinks.set(this.buildShareLinks(article, this.currentUrl()));

			if (!isPlatformBrowser(this.platformId)) {
				return;
			}
		});
	}

	ngAfterViewChecked(): void {
		if (!isPlatformBrowser(this.platformId)) return;

		if (
			this.contentBodyRef() &&
			this.contentHtml() &&
			!this.copyButtonsInitialized
		) {
			this.initCopyButtons();
			this.copyButtonsInitialized = true;
		}
	}

	private initCopyButtons(): void {
		const container = this.contentBodyRef()?.nativeElement;
		if (!container) return;

		const copyButtons =
			container.querySelectorAll<HTMLButtonElement>(".code-block__copy");
		copyButtons.forEach((btn) => {
			const handler = (e: Event) => {
				e.preventDefault();
				e.stopPropagation();
				const code = btn.getAttribute("data-code") ?? "";
				const decodedCode = this.unescapeHtml(code);
				this.copyCodeToClipboard(decodedCode, btn);
			};
			btn.addEventListener("click", handler);
			this.copyButtonHandlers.set(btn, handler);
		});
	}

	private copyCodeToClipboard(code: string, button: HTMLButtonElement): void {
		if (!isPlatformBrowser(this.platformId)) return;

		if (!navigator?.clipboard) return;

		// Prevent rapid re-clicks during animation
		if (button.classList.contains("copy-button--success")) return;

		from(navigator.clipboard.writeText(code)).subscribe({
			next: () => {
				button.classList.add("copy-button--success");
				const tid = setTimeout(() => {
					button.classList.remove("copy-button--success");
					this.feedbackTimeoutIds.delete(tid);
				}, 2000);
				this.feedbackTimeoutIds.add(tid);
			},
			error: () => {
				button.classList.add("copy-button--error");
				const tid = setTimeout(() => {
					button.classList.remove("copy-button--error");
					this.feedbackTimeoutIds.delete(tid);
				}, 2000);
				this.feedbackTimeoutIds.add(tid);
			},
		});
	}

	private unescapeHtml(value: string): string {
		return value
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#039;/g, "'");
	}

	private renderMarkdown(markdown: string): void {
		const tocItems: TocItem[] = [];
		const slugCounts = new Map<string, number>();
		const renderer = new marked.Renderer();

		renderer.heading = (token) => {
			const normalizedLevel = this.normalizeHeadingLevel(token.depth);
			const base = slugify(token.text) || "section";
			const count = (slugCounts.get(base) ?? 0) + 1;
			slugCounts.set(base, count);
			const anchor = count > 1 ? `${base}-${count}` : base;
			tocItems.push({
				id: anchor,
				text: token.text,
				level: normalizedLevel,
			});
			const inner = marked.Parser.parseInline(token.tokens, { renderer });
			return `<h${normalizedLevel} id="${anchor}">${inner}</h${normalizedLevel}>`;
		};

		renderer.code = (token) => {
			const parts = (token.lang ?? "").trim().split(/\s+/);
			const language = (parts[0] ?? "").toLowerCase();
			const isOpen = parts.some((p) => p.toLowerCase() === "open");
			const canHighlight = Boolean(language && hljs.getLanguage(language));
			const highlighted = canHighlight
				? hljs.highlight(token.text, { language, ignoreIllegals: true }).value
				: hljs.highlightAuto(token.text).value;
			const className = canHighlight
				? `language-${language}`
				: "language-plaintext";
			const displayLang = language || "code";
			const escapedCode = this.escapeHtml(token.text);
			// Generate animation-ready HTML with dual-icon structure
			return `<details class="code-block"${isOpen ? " open" : ""}>
        <summary class="code-block__header">
          <span class="code-block__lang">${displayLang}</span>
          <button type="button" class="code-block__copy copy-button" data-code="${escapedCode}" title="Copy code" aria-label="Copy code">
            <span class="copy-button__icon copy-button__icon--idle">
              <i class="fa-regular fa-copy"></i>
            </span>
            <span class="copy-button__icon copy-button__icon--success">
              <i class="fa-solid fa-check"></i>
            </span>
          </button>
        </summary>
        <pre><code class="hljs ${className}">${highlighted}</code></pre>
      </details>`;
		};

		const html = marked(markdown, {
			gfm: true,
			breaks: false,
			renderer,
		}) as string;

		this.contentHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));
		this.tocItems.set(tocItems);
		this.readingTimeMinutes.set(
			this.estimateReadingTimeFromText(this.stripHtml(html)),
		);
	}

	private estimateReadingTimeFromText(text: string): number {
		const words = text.trim().split(/\s+/).filter(Boolean).length;

		return Math.max(1, Math.ceil(words / 200));
	}

	private buildShareLinks(article: ArticleModel, url: string): ShareLink[] {
		const encodedUrl = encodeURIComponent(url);
		const encodedTitle = encodeURIComponent(article.headline);
		return [
			{
				label: "Twitter",
				url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
				iconClass: "fa-brands fa-twitter",
			},
			{
				label: "LinkedIn",
				url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
				iconClass: "fa-brands fa-linkedin-in",
			},
		];
	}

	private normalizeHeadingLevel(level: number): 1 | 2 | 3 | 4 | 5 | 6 {
		if (level <= 1) {
			return 1;
		}
		if (level >= 6) {
			return 6;
		}
		return level as 2 | 3 | 4 | 5 | 6;
	}



	private stripHtml(value: string): string {
		return value.replace(/<[^>]*>/g, " ");
	}

	private escapeHtml(value: string): string {
		return value
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	ngOnDestroy(): void {
		this.copyButtonHandlers.forEach((handler, btn) => {
			btn.removeEventListener("click", handler);
		});
		this.copyButtonHandlers.clear();
		this.feedbackTimeoutIds.forEach((id) => {
			clearTimeout(id);
		});
		this.feedbackTimeoutIds.clear();
	}
}
