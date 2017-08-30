import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription'

import { SampleQueryService } from './sample-query.service'

import { SampleQuery } from './sample-query'


@Component({
  moduleId: module.id,
  selector: 'search-controls',
  templateUrl: 'search-controls.component.html'
})
export class SearchControlsComponent implements OnDestroy {

  private sampleQuery: SampleQuery;
  private sampleQuerySubscripion: Subscription;

  constructor(
    private sampleQueryService: SampleQueryService
  ) {
    this.sampleQuery = this.sampleQueryService.getCurrentQuery();
    this.sampleQuerySubscripion = this.sampleQueryService.query$.subscribe(
      query => { this.sampleQuery = query; }
    )
  }

  ngOnDestroy() {
    this.sampleQuerySubscripion.unsubscribe();
  }

}
