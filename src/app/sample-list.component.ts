

import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription'

import { SampleQueryService } from './sample-query.service'

import { SampleQuery } from './sample-query'

@Component({
  moduleId: module.id,
  selector: 'samplelist',
  templateUrl: 'sample-list.component.html'
})
export class SampleListComponent {

  private sampleQuery: SampleQuery = this.sampleQueryService.getCurrentQuery();
  private sampleQuerySubscription: Subscription = this.sampleQueryService.query$.subscribe(
    query => { this.sampleQuery = query; }
  )

  constructor(
    private sampleQueryService: SampleQueryService
  ) {}

}
