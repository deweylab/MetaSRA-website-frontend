import { Component } from '@angular/core';

@Component({
  selector: 'main-container',
  template: `
    <div class="container" style="margin-top: 100px">
      <search-controls></search-controls>
      <sample-list></sample-list>
    </div>`,
})
export class MainContainerComponent  { }
