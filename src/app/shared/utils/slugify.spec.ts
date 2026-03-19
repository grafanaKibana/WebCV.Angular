import { slugify } from './slugify';

describe('slugify', () => {
	it('should lowercase and replace spaces with hyphens', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('should remove special characters', () => {
		expect(slugify('Hello World!')).toBe('hello-world');
	});

	it('should handle multiple consecutive special chars', () => {
		expect(slugify('foo  bar--baz')).toBe('foo-bar-baz');
	});

	it('should strip leading and trailing hyphens', () => {
		expect(slugify('---leading-trailing---')).toBe('leading-trailing');
	});

	it('should return empty string for empty input', () => {
		expect(slugify('')).toBe('');
	});

	it('should handle already-slugified input', () => {
		expect(slugify('already-slugified')).toBe('already-slugified');
	});

	it('should handle uppercase input', () => {
		expect(slugify('UPPERCASE')).toBe('uppercase');
	});
});
