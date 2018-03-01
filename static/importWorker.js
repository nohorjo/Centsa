self.addEventListener('message', e => {
    const {
        rule,
        csv
    } = e.data;

    //TODO: implement
    let i = 0;
    setInterval(() => {
        if (i == 50) {
            self.close();
            throw "Done";
        }
        self.postMessage({
            processed: i++,
            total: 50
        });
    }, 200);
});