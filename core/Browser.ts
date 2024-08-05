import puppeteer from "puppeteer";

export default async () => puppeteer.launch({
    executablePath: process.env.BROWSER,
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu'
    ]
});