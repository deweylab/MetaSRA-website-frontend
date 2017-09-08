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
  private termInfoUpdateSubscription: Subscription;

  constructor(
    private sampleQueryService: SampleQueryService
  ) {
    this.sampleQuery = this.sampleQueryService.getCurrentQuery();
    this.sampleQuerySubscripion = this.sampleQueryService.query$.subscribe(
      query => { this.sampleQuery = query; }
    )

    // This observable may be triggered right after the page loads, to update
    // term names from the ID's in the URL query string.  It's a separate observable
    // because we don't want to change the results, only the display of the query
    // terms.
    this.termInfoUpdateSubscription = this.sampleQueryService.termInfoUpdate$.subscribe(
      query => { this.sampleQuery = query; }
    )
  }

  ngOnDestroy() {
    this.sampleQuerySubscripion.unsubscribe();
  }

}
