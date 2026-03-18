import { isPlatformBrowser } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	inject,
	PLATFORM_ID,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize, take } from "rxjs/operators";
import { HomeDataService } from "../../../services/home-data.service";
import { AboutMeSectionComponent } from "../about-me-section/about-me-section.component";
import { EducationSectionComponent } from "../education-section/education-section.component";
import { ExperienceSectionComponent } from "../experience-section/experience-section.component";
import { ProfileSectionComponent } from "../profile-section/profile-section.component";
import { SkillsSectionComponent } from "../skills-section/skills-section.component";

@Component({
	selector: "app-home-pages",
	imports: [
		ProfileSectionComponent,
		AboutMeSectionComponent,
		EducationSectionComponent,
		ExperienceSectionComponent,
		SkillsSectionComponent,
	],
	templateUrl: "./home-page.component.html",
	styleUrls: ["./home-page.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
	readonly homeReady = signal(false);

	private readonly destroyRef = inject(DestroyRef);
	private readonly homeDataService = inject(HomeDataService);
	private readonly platformId = inject(PLATFORM_ID);

	constructor() {
		if (isPlatformBrowser(this.platformId)) {
			document.documentElement.classList.add("home-prehide");
			this.destroyRef.onDestroy(() => {
				document.documentElement.classList.remove("home-prehide");
			});
		}

		this.homeDataService
			.getHomeData()
			.pipe(
				take(1),
				takeUntilDestroyed(this.destroyRef),
				finalize(() => {
					if (!isPlatformBrowser(this.platformId)) return;
					document.documentElement.classList.remove("home-prehide");
				}),
			)
		.subscribe(() => {
			this.homeReady.set(true);
		});
	}
}
