describe('General', () => {
    describe('getBudget', () => {
        it('calculates budget');
        it('calculates strict budget');
        it('returns 500 with error');
    });
    describe('getRules', () => {
        it('returns rules');
        it('returns 500 with error');
    });
    describe('getRule', () => {
        it('returns script');
        it('returns 500 with error');
    });
    describe('insertRule', () => {
        it('inserts script');
        it('returns 400 with no name');
        it('returns 500 with error');
    });
});