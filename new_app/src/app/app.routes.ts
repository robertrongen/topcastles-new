import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home-page.component').then(m => m.HomePageComponent) },
  // Main castle list — supports ?country=, ?region=, ?castleType=, ?condition= query params
  { path: 'top1000', loadComponent: () => import('./pages/top100/top100-page.component').then(m => m.Top100PageComponent) },
  // Castle detail
  { path: 'castles/:code', loadComponent: () => import('./pages/castle-detail/castle-detail-page.component').then(m => m.CastleDetailPageComponent) },
  // Redirects for phased-out pages
  { path: 'castles', redirectTo: '/top1000', pathMatch: 'full' },
  { path: 'countries/:country', loadComponent: () => import('./pages/country-redirect/country-redirect.component').then(m => m.CountryRedirectComponent) },
  // Background / informational pages
  { path: 'top-countries', loadComponent: () => import('./pages/top-countries/top-countries-page.component').then(m => m.TopCountriesPageComponent) },
  { path: 'top-regions', loadComponent: () => import('./pages/top-regions/top-regions-page.component').then(m => m.TopRegionsPageComponent) },
  { path: 'nocastle/:code', loadComponent: () => import('./pages/nocastle-detail/nocastle-detail-page.component').then(m => m.NoCastleDetailPageComponent) },
  { path: 'background', loadComponent: () => import('./pages/background/background-page.component').then(m => m.BackgroundPageComponent) },
  { path: 'developer', loadComponent: () => import('./pages/developer/developer-page.component').then(m => m.DeveloperPageComponent) },
  { path: '**', redirectTo: '' },
];
