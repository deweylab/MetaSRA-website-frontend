/**
Root component, just contains the router.
*/

import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent  { name = 'Angular'; }
