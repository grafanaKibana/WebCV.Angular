import { PLATFORM_ID } from "@angular/core";
import {
	type ComponentFixture,
	fakeAsync,
	TestBed,
	tick,
} from "@angular/core/testing";
import { jest } from "@jest/globals";

import { CopyButtonComponent } from "./copy-button.component";

describe("CopyButtonComponent", () => {
	let component: CopyButtonComponent;
	let fixture: ComponentFixture<CopyButtonComponent>;

	const originalClipboard = Object.getOwnPropertyDescriptor(
		globalThis.navigator,
		"clipboard",
	);

	const setClipboard = (writeText: (text: string) => Promise<void>): void => {
		Object.defineProperty(globalThis.navigator, "clipboard", {
			configurable: true,
			value: { writeText },
		});
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [CopyButtonComponent],
			providers: [{ provide: PLATFORM_ID, useValue: "browser" }],
		}).compileComponents();

		fixture = TestBed.createComponent(CopyButtonComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	afterEach(() => {
		if (originalClipboard) {
			Object.defineProperty(
				globalThis.navigator,
				"clipboard",
				originalClipboard,
			);
		} else {
			Object.defineProperty(globalThis.navigator, "clipboard", {
				configurable: true,
				value: undefined,
			});
		}
		jest.clearAllTimers();
		jest.useRealTimers();
		jest.restoreAllMocks();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});

	it("should start in idle state", () => {
		expect(component.state()).toBe("idle");
		expect(component.currentLabel).toBe("Copy");
	});

	it("should transition to success state and emit copied text", fakeAsync(() => {
		const writeText = jest
			.fn<(text: string) => Promise<void>>()
			.mockResolvedValue(undefined);
		setClipboard(writeText);
		const copiedSpy = jest.fn();

		fixture.componentRef.setInput("text", "hello world");
		component.copied.subscribe(copiedSpy);

		component.copy();
		tick();

		expect(writeText).toHaveBeenCalledWith("hello world");
		expect(component.state()).toBe("success");
		expect(component.currentLabel).toBe("Copied!");
		expect(copiedSpy).toHaveBeenCalledWith("hello world");
	}));

	it("should transition to error state and emit copyError on clipboard rejection", fakeAsync(() => {
		const rejection = new Error("denied");
		const writeText = jest
			.fn<(text: string) => Promise<void>>()
			.mockRejectedValue(rejection);
		setClipboard(writeText);
		const errorSpy = jest.fn();

		component.copyError.subscribe(errorSpy);

		component.copy();
		tick();

		expect(component.state()).toBe("error");
		expect(component.currentLabel).toBe("Copy failed");
		expect(errorSpy).toHaveBeenCalledWith(rejection);
	}));

	it("should reset to idle after feedbackDuration", fakeAsync(() => {
		const writeText = jest
			.fn<(text: string) => Promise<void>>()
			.mockResolvedValue(undefined);
		setClipboard(writeText);

		component.copy();
		tick();
		expect(component.state()).toBe("success");

		tick(2000);
		expect(component.state()).toBe("idle");
		expect(component.currentLabel).toBe("Copy");
	}));

	it("should ignore rapid clicks while in feedback state", fakeAsync(() => {
		const writeText = jest
			.fn<(text: string) => Promise<void>>()
			.mockResolvedValue(undefined);
		setClipboard(writeText);

		component.copy();
		tick();
		expect(component.state()).toBe("success");

		component.copy();
		tick();

		expect(writeText).toHaveBeenCalledTimes(1);
	}));

	it("should emit error when clipboard API is unavailable", () => {
		Object.defineProperty(globalThis.navigator, "clipboard", {
			configurable: true,
			value: undefined,
		});
		const errorSpy = jest.fn();

		component.copyError.subscribe(errorSpy);
		component.copy();

		expect(component.state()).toBe("error");
		expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
	});

	it("should clear reset timeout on destroy", fakeAsync(() => {
		jest.useFakeTimers();
		const writeText = jest
			.fn<(text: string) => Promise<void>>()
			.mockResolvedValue(undefined);
		setClipboard(writeText);

		component.copy();
		tick();
		expect(component.state()).toBe("success");

		fixture.destroy();
		tick(2000);

		expect(component.state()).toBe("success");
	}));
});
