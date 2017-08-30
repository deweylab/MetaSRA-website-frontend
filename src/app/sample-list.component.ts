

import { Component } from '@angular/core';
import { Subscription } from 'rxjs/Subscription'

import { SampleQueryService } from './samplequery.service'

import { SampleQuery } from './samplequery'

@Component({
  moduleId: module.id,
  selector: 'samplelist',
  templateUrl: 'samplelist.component.html'
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
