import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({ selector: 'app-country-redirect', template: '', standalone: true })
export class CountryRedirectComponent implements OnInit {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    const country = this.route.snapshot.params['country'];
    const region  = this.route.snapshot.queryParams['region'];
    const queryParams: Record<string, string> = { country };
    if (region) queryParams['region'] = region;
    this.router.navigate(['/top1000'], { queryParams, replaceUrl: true });
  }
}
