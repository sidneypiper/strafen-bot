import { Penalty } from "../database/entity/Penalty";
import getBrowser from "../core/Browser"
import { render } from 'preact-render-to-string';
import { html } from 'htm/preact';
import Table from "./Table";

export default async function (penalties: Penalty[]): Promise<Buffer> {

    const headers = ['Name', 'Description', 'Price']
    const rows = penalties.map(penalty => ({
        name: penalty.name,
        description: penalty.description,
        price: penalty.price
    }))

    const htmlString = render(html`
        <${Table} headers=${headers} rows=${rows}/>`)

    try {
        const browser = await getBrowser()
        const page = await browser.newPage();

        await page.setViewport({
            width: 2560,
            height: 4000
        });

        await page.setContent(htmlString);

        const selector = '#table';
        await page.waitForSelector(selector);
        const table = await page.$(selector);

        const screenshotBuffer = await table.screenshot({ type: 'png' });

        await browser.close();

        return screenshotBuffer;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

