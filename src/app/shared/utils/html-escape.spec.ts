import { escapeHtml, unescapeHtml } from './html-escape';

describe('escapeHtml', () => {
	it('should escape < and >', () => {
		expect(escapeHtml('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;/b&gt;');
	});
	it('should escape ampersand', () => {
		expect(escapeHtml('a & b')).toBe('a &amp; b');
	});
	it('should escape double quotes', () => {
		expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
	});
	it('should escape single quotes', () => {
		expect(escapeHtml("it's")).toBe("it&#039;s");
	});
	it('should return empty string unchanged', () => {
		expect(escapeHtml('')).toBe('');
	});
});

describe('unescapeHtml', () => {
	it('should unescape &lt; and &gt;', () => {
		expect(unescapeHtml('&lt;b&gt;bold&lt;/b&gt;')).toBe('<b>bold</b>');
	});
	it('should unescape &amp;', () => {
		expect(unescapeHtml('a &amp; b')).toBe('a & b');
	});
	it('should roundtrip: unescapeHtml(escapeHtml(x)) === x', () => {
		const original = '<script>alert("xss & \'test\'")</script>';
		expect(unescapeHtml(escapeHtml(original))).toBe(original);
	});
});
