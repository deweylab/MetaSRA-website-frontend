

import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription'

import { SampleQueryService, QueryStatus } from './sample-query.service'
import { SampleQuery } from './sample-query'

@Component({
  moduleId: module.id,
  selector: 'samplelist',
  templateUrl: 'sample-list.component.html'
})
export class SampleListComponent implements OnInit, OnDestroy{

  private sampleQuery: SampleQuery = this.sampleQueryService.getCurrentQuery();
  private sampleQuerySubscription: Subscription = this.sampleQueryService.query$.subscribe(
    query => { this.sampleQuery = query; }
  )

  private queryStatus: QueryStatus;
  private queryStatusSubscription: Subscription;
  private queryStatusString: string;

  constructor(
    private sampleQueryService: SampleQueryService
  ) {}

  ngOnInit() {
    this.queryStatusSubscription = this.sampleQueryService.queryStatus$.subscribe(
      status => {this.queryStatus = status; this.queryStatusString = JSON.stringify(status)}
    )
  }

  ngOnDestroy() {
    this.queryStatusSubscription.unsubscribe()
  }

}
