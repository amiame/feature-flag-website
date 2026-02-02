import { expect, webkit, Browser, BrowserContext } from '@playwright/test';

export class Page {
  private browser: Browser;
  private context: BrowserContext;
  private feURL: string;
  private envPageRe: RegExp;
  private svcPageRe: RegExp;

  constructor(feURL: string) {
    this.feURL = feURL;
    this.envPageRe = new RegExp(`^${this.feURL}/.*/environments$`);
    this.svcPageRe = new RegExp(`^${this.feURL}/.*/services$`);
  }

  async create(): Promise<void> {
    this.browser = await webkit.launch();
    this.context = await this.browser.newContext();
  }

  async close(): Promise<void> {
    await this.browser.close();
  }

  async gotoEnvironmentPage(): Promise<string[]> {
    const page = await this.context.newPage();
    const currentPageURL = page.url();

    switch (true) {
      case this.envPageRe.test(currentPageURL):
        // Already on environments page. Do nothing.
        break;
      case this.svcPageRe.test(currentPageURL):
        expect(page.locator('data-test-id=environments-link')).toBeVisible();
        await page.click('data-test-id=environments-link');
        break;
      default:
        throw new Error(`Cannot navigate to environments page from ${currentPageURL}`);
    }

    // Grab environment names from the environments list
    const environmentElements = page.locator('data-test-id=environment-name');
    const environmentCount = await environmentElements.count();
    const environmentNames: string[] = [];
    for (let i = 0; i < environmentCount; i++) {
      environmentNames.push(await environmentElements.nth(i).innerText());
    }

    return environmentNames;
  }

  async gotoServicePage(env: string): Promise<string[]> {
    const page = await this.context.newPage();
    const currentPageURL = page.url();
    const svcPageRe = new RegExp(`^${this.feURL}/${env}/services$`);

    switch (true) {
      case svcPageRe.test(currentPageURL):
        // Already on services page. Do nothing.
        break;
      case this.envPageRe.test(currentPageURL):
        expect(page.locator('data-test-id=first-environment-services-link')).toBeVisible();
        await page.click('data-test-id=first-environment-services-link');
        break;
      default:
        throw new Error(`Cannot navigate to services page from ${currentPageURL}`);
    }

    // Grab service names from the services list
    const serviceElements = page.locator('data-test-id=service-name');
    const serviceCount = await serviceElements.count();
    const serviceNames: string[] = [];
    for (let i = 0; i < serviceCount; i++) {
      serviceNames.push(await serviceElements.nth(i).innerText());
    }

    return serviceNames;
  }
}
