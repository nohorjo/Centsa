describe('index', () => {
    describe('main', () => {
        it('starts up debug mode');
        it('sets up cluster');
        it('calls to set up worker');
    });
    describe('checkConfig', () => {
        it('checks config and continues');
        it('exits application when config is missing');
    });
    describe('initWorker', () => {
        it('sets up dev worker');
        it('sets up production worker');
        it('sets up auto transactions');
    });
});