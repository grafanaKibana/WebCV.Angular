import {
	animate,
	query,
	style,
	transition,
	trigger,
} from "@angular/animations";
import { isPlatformBrowser } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	inject,
	PLATFORM_ID,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	ChildrenOutletContexts,
	NavigationEnd,
	NavigationStart,
	Router,
	RouterOutlet,
} from "@angular/router";
import { filter } from "rxjs/operators";
import { DynamicReflectionService } from "./services/dynamic-reflection.service";
import { type PageMeta, SeoService } from "./services/seo.service";
import { FooterComponent } from "./shared/footer/footer.component";
import { HeaderComponent } from "./shared/header/header.component";
import { IntroOverlayComponent } from "./shared/intro-overlay/intro-overlay.component";
import { WebGLBackgroundComponent } from "./shared/webgl-background/webgl-background.component";

const ROUTE_META: Record<string, PageMeta> = {
	"/": {
		title: "Nikita Reshetnik — Senior AI Engineer",
		path: "/",
	},
	"/blog": {
		title: "Blog | Nikita Reshetnik",
		description:
			"Articles on AI engineering, .NET, LLMs, and software development by Nikita Reshetnik.",
		path: "/blog",
	},
};

@Component({
	selector: "app-root",
	imports: [
		RouterOutlet,
		HeaderComponent,
		FooterComponent,
		IntroOverlayComponent,
		WebGLBackgroundComponent,
	],
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger("routeAnimations", [
			transition("* <=> *", [
				query(
					":leave",
					[
						style({
							display: "none",
						}),
					],
					{ optional: true },
				),
				query(
					":enter",
					[
						style({
							transform: "translateY(20px)",
						}),
						animate(
							"350ms cubic-bezier(0.4, 0.0, 0.2, 1)",
							style({ transform: "translateY(0)" }),
						),
					],
					{ optional: true },
				),
			]),
		]),
	],
})
export class AppComponent {
	title = "webcv-angular";
	private readonly destroyRef = inject(DestroyRef);
	private readonly router = inject(Router);
	private readonly contexts = inject(ChildrenOutletContexts);
	private readonly dynamicReflectionService = inject(DynamicReflectionService);
	private readonly seoService = inject(SeoService);
	private readonly platformId = inject(PLATFORM_ID);

	constructor() {
		this.router.events
			.pipe(
				filter(
					(event): event is NavigationStart => event instanceof NavigationStart,
				),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe(() => {
				this.dynamicReflectionService.applyLastReflection();
			});

		// Scroll to top on route change
		this.router.events
			.pipe(
				filter(
					(event): event is NavigationEnd => event instanceof NavigationEnd,
				),
				takeUntilDestroyed(this.destroyRef),
			)
			.subscribe((event) => {
				const url = event.urlAfterRedirects;
				const fragment = this.router.parseUrl(url).fragment;
				if (fragment) {
					return;
				}
				if (isPlatformBrowser(this.platformId)) {
					window.scrollTo({ top: 0, behavior: "smooth" });
					requestAnimationFrame(() => {
						this.dynamicReflectionService.applyLastReflection();
					});
				}

				const path = url.split("?")[0].split("#")[0];
				const meta = ROUTE_META[path];
				if (meta) {
					this.seoService.updatePageMeta(meta);
				} else if (path.startsWith("/blog/")) {
					this.seoService.updatePageMeta({
						title: "Blog | Nikita Reshetnik",
						path,
					});
				}
			});
	}

	getRouteAnimationData(): string {
		return (
			this.contexts.getContext("primary")?.route?.snapshot?.data?.[
				"animation"
			] || "HomePage"
		);
	}

	onRouteActivate(): void {
		if (!isPlatformBrowser(this.platformId)) return;

		requestAnimationFrame(() => {
			this.dynamicReflectionService.applyLastReflection();
		});
	}
}
