import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home-page.component').then(m => m.HomePageComponent) },
  { path: 'castles', loadComponent: () => import('./pages/castles/castles-page.component').then(m => m.CastlesPageComponent) },
  { path: 'castles/:code', loadComponent: () => import('./pages/castle-detail/castle-detail-page.component').then(m => m.CastleDetailPageComponent) },
  { path: 'top100', loadComponent: () => import('./pages/top100/top100-page.component').then(m => m.Top100PageComponent) },
  { path: 'countries', loadComponent: () => import('./pages/countries/countries-page.component').then(m => m.CountriesPageComponent) },
  { path: 'countries/:country', loadComponent: () => import('./pages/country-detail/country-detail-page.component').then(m => m.CountryDetailPageComponent) },
  { path: 'types', loadComponent: () => import('./pages/types/types-page.component').then(m => m.TypesPageComponent) },
  { path: 'search', loadComponent: () => import('./pages/search/search-page.component').then(m => m.SearchPageComponent) },
  { path: 'nocastle/:code', loadComponent: () => import('./pages/nocastle-detail/nocastle-detail-page.component').then(m => m.NoCastleDetailPageComponent) },
  { path: 'background', loadComponent: () => import('./pages/background/background-page.component').then(m => m.BackgroundPageComponent) },
  { path: 'visitors', loadComponent: () => import('./pages/visitors/visitors-page.component').then(m => m.VisitorsPageComponent) },
  { path: '**', redirectTo: '' },
];
