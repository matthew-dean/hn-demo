import { newE2EPage } from '@stencil/core/testing';

describe('Story List', () => {
  it('should render app-fetcher', async () => {
    const page = await newE2EPage();
    await page.setContent(`<app-fetcher></app-fetcher>`);
    const el = await page.find('app-fetcher');
    expect(el).toBeDefined();
  });

  it('should show the end of the list with no data', async () => {
    const page = await newE2EPage();
    await page.setContent(`<app-storylist></app-storylist>`);
    const el = await page.find('app-storylist >>> .loading span');
    expect(el).toEqualText('End of list');

    // await page.$eval('app-storylist', (elm: any) => {
    //   elm.first = 'Marty';
    //   elm.lastName = 'McFly';
    // }); 
  });

  it('should render a list', async () => {
    const page = await newE2EPage();
    await page.setContent(`<app-storylist></app-storylist>`);

    await page.$eval('app-storylist', (elm: any) => {
      elm.data = [{
        by: "webappsecperson",
        descendants: 0,
        id: 19950303,
        score: 1,
        time: 1558222015,
        title: "Remote Dev Jobs",
        type: "story",
        url: "https://remotedevjobs.co/blog/introducing-remotedevjobs"
      }]
    }); 

    await page.waitForChanges();

    const title = await page.find('app-storylist >>> .story .title');
    expect(title).toEqualText('Remote Dev Jobs');

    const value = await title.getProperty('href');
    expect(value).toBe('https://remotedevjobs.co/blog/introducing-remotedevjobs');

    const el = await page.find('app-storylist >>> .list');
    expect(el).not.toHaveClass('has-error');
  });

  it('should render an error', async () => {
    const page = await newE2EPage();
    await page.setContent(`<app-storylist></app-storylist>`);

    await page.$eval('app-storylist', (elm: any) => {
      elm.hasError = true;
    }); 

    await page.waitForChanges();

    const el = await page.find('app-storylist >>> .list');
    expect(el).toHaveClass('has-error');
  });
});