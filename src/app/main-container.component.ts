import { Component } from '@angular/core';

@Component({
  selector: 'main-container',
  template: `
    <div class="container">
      <search-controls></search-controls>
      <sample-list></sample-list>
    </div>`,
})
export class MainContainerComponent  { }
