import {
  Page,
} from '../driver/page';

export class FFService {
  private page: Page;

  constructor(feURL: string) {
    this.page = new Page(feURL);
  }

  async showEnvironments(): Promise<string[]> {
    return await this.page.gotoEnvironmentPage();
  }

  async showServices(env: string): Promise<string[]> {
    return await this.page.gotoServicePage(env);
  }
}
