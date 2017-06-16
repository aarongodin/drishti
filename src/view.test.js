import { View } from './view';

describe('View', () => {
	describe('constructor', () => {
		it('should be a View', () => {
			const actual = new View();
			expect(actual).toBeInstanceOf(View);
		});
	});
});
