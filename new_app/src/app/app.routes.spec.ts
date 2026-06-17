import { routes } from './app.routes';

describe('app routes', () => {
  it('loads the castle list at /castles so query-param filters survive direct navigation', () => {
    const castlesRoute = routes.find(route => route.path === 'castles');

    expect(castlesRoute).toBeTruthy();
    expect(castlesRoute?.redirectTo).toBeUndefined();
    expect(castlesRoute?.loadComponent).toBeTruthy();
  });
});
