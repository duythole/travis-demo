// const puppeteer = require('puppeteer');

const Page = require('./helper/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:5000');

});

afterEach(async () => {
    await page.close();
});


describe('test api', () => {

    it('test api get al data', async () => {
        // test('Test api get data from mongo', async () => {

            const result = await page.evaluate(() => {
                return fetch('/api/blogs', {
                    method: 'GET'
                }).then(res => res.json());
            });

            // console.log(JSON.stringify(result));
            expect(result).toEqual([]);
        // });
    });


    it('Test count data from mongo', async () => {

        const result = await page.evaluate(() => {
            return fetch('/api/blogs/count', {
                method: 'GET'
            }).then(res => res.json());
        });
        expect(result).toEqual({ "data": 0 });
        // console.log(JSON.stringify(result));
        // await page.close();
    });


});



