import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-developer-page',
  standalone: true,
  imports: [
    MatTabsModule, MatCardModule, MatIconModule,
    MatButtonModule, MatChipsModule, MatExpansionModule,
  ],
  templateUrl: './developer-page.component.html',
  styleUrl: './developer-page.component.scss',
})
export class DeveloperPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  selectedIndex = signal(0);
  copied = signal('');

  readonly tabs = ['overview', 'rest-api', 'mcp', 'schema', 'ai-agents'];

  readonly castleTypes = ['Hilltop castle', 'Rock castle', 'Water castle', 'Harbour castle', 'City castle'];
  readonly conditions  = ['Intact', 'Rebuild/Restored', 'Damaged', 'Ruined/Partly remained', 'Destroyed'];

  readonly snippets: Record<string, string> = {
    quickstart:
`fetch('/api/top100.json')
  .then(r => r.json())
  .then(castles => console.log(castles.slice(0, 10)));`,

    curlIndex:   `curl /api/index.json`,
    curlAll:     `curl /api/castles.json`,
    curlTop100:  `curl /api/top100.json`,
    curlCountry:
`curl /api/by-country/france.json
curl /api/by-country/germany.json
curl /api/by-country/england.json
curl /api/by-country/northern-ireland.json`,

    jsExample:
`// Top castles in Spain
const castles = await fetch('/api/by-country/spain.json').then(r => r.json());
const top5 = castles.slice(0, 5).map(c => \`\${c.position}. \${c.castle_name} (\${c.score_total})\`);
console.log(top5);`,

    pyExample:
`import requests

# UNESCO World Heritage castles
castles = requests.get('/api/castles.json').json()
unesco = [c for c in castles if c.get('heritage_status') and 'UNESCO' in c['heritage_status']]
print(f"{len(unesco)} UNESCO castles found")`,

    mcpUrl: `https://topcastles.hobunror.synology.me/mcp`,
    mcpConfig:
`{
  "mcpServers": {
    "topcastles": {
      "url": "https://topcastles.hobunror.synology.me/mcp"
    }
  }
}`,

    toolSearch:  `search_castles({ castle_type: "Water castle", condition: "Intact", limit: 5 })`,
    toolGet:     `get_castle({ castle_code: "krak-des-chevaliers" })`,
    toolCountries: `list_countries()`,
    toolNearby:  `nearby_castles({ latitude: 48.85, longitude: 2.35, max_km: 100, limit: 10 })`,

    agentFrance:
`// Fetch country endpoint, slice top N
const castles = await fetch('/api/by-country/france.json').then(r => r.json());
return castles.slice(0, 10); // already sorted by score_total desc`,

    agentUnesco:
`const castles = await fetch('/api/castles.json').then(r => r.json());
return castles.filter(c => c.heritage_status?.includes('UNESCO'));`,

    agentNearby:
`// Use MCP tool:
nearby_castles({ latitude: 48.85, longitude: 2.35, max_km: 100, limit: 10 })

// Or compute Haversine manually:
function dist(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}`,

    agentCountry:
`// Use MCP:
list_countries()  // returns sorted by count desc

// Or via REST:
const idx = await fetch('/api/index.json').then(r => r.json());
const top = [...idx.countries].sort((a,b) => b.count - a.count)[0];`,
  };

  constructor() {
    this.route.queryParams.subscribe(p => {
      const idx = this.tabs.indexOf(p['tab'] ?? 'overview');
      this.selectedIndex.set(idx >= 0 ? idx : 0);
    });
  }

  onTabChange(index: number): void {
    this.selectedIndex.set(index);
    this.router.navigate([], { queryParams: { tab: this.tabs[index] }, replaceUrl: true });
  }

  copy(key: string): void {
    const text = this.snippets[key] ?? key;
    navigator.clipboard?.writeText(text).then(() => {
      this.copied.set(key);
      setTimeout(() => this.copied.set(''), 2000);
    });
  }
}
