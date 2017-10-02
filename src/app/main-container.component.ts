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
