import puppeteer from "puppeteer";

export default async () => puppeteer.launch({ executablePath: process.env.BROWSER });