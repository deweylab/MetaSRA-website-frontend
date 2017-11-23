/*
This doesn't do much - just includes the search-controls and result-container
directives inside of a bootstrap container.
*/

import { Component } from '@angular/core';

@Component({
  selector: 'main-container',
  template: `
    <div class="container">
      <search-controls></search-controls>
      <result-container></result-container>
    </div>`,
})
export class MainContainerComponent  { }
