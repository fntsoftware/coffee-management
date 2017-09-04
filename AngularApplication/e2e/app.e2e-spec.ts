import { KaffeeverwaltungPage } from './app.po';

describe('kaffeeverwaltung App', () => {
  let page: KaffeeverwaltungPage;

  beforeEach(() => {
    page = new KaffeeverwaltungPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
