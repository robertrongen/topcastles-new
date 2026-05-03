import { Routes } from '@angular/router';
import { adminAuthGuard } from './pages/admin/guards/admin-auth.guard';
import { adminLoginGuard } from './pages/admin/guards/admin-login.guard';

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
  { path: 'favorites', loadComponent: () => import('./pages/favorites/favorites-page.component').then(m => m.FavoritesPageComponent) },
  { path: 'favorites/:id', loadComponent: () => import('./pages/favorites-detail/favorites-detail-page.component').then(m => m.FavoritesDetailPageComponent) },
  { path: 'install', loadComponent: () => import('./pages/install/install-page.component').then(m => m.InstallPageComponent) },

  // Admin — login is public; all other admin routes protected by adminAuthGuard
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/admin-login.component').then(m => m.AdminLoginComponent),
    canActivate: [adminLoginGuard],
    data: { prerender: false },
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/shell/admin-shell.component').then(m => m.AdminShellComponent),
    canActivate: [adminAuthGuard],
    data: { prerender: false },
    children: [
      { path: '', redirectTo: 'editorial', pathMatch: 'full' },
      {
        path: 'editorial',
        loadComponent: () => import('./pages/admin/editorial-overview/admin-editorial-overview.component').then(m => m.AdminEditorialOverviewComponent),
        data: { prerender: false },
      },
      {
        path: 'editorial/:file',
        loadComponent: () => import('./pages/admin/editorial-placeholder/admin-editorial-placeholder.component').then(m => m.AdminEditorialPlaceholderComponent),
        data: { prerender: false },
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
