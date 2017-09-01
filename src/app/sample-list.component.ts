

import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription'

import { SampleQueryService, QueryStatus } from './sample-query.service'
import { SampleQuery } from './sample-query'

@Component({
  moduleId: module.id,
  selector: 'sample-list',
  templateUrl: 'sample-list.component.html'
})
export class SampleListComponent implements OnInit, OnDestroy{

  private sampleQuery: SampleQuery = this.sampleQueryService.getCurrentQuery();
  private sampleQuerySubscription: Subscription = this.sampleQueryService.query$.subscribe(
    query => { this.sampleQuery = query; }
  )

  private queryStatus: QueryStatus = this.sampleQueryService.getCurrentQueryStatus();
  private queryStatusSubscription: Subscription;

  constructor(
    private sampleQueryService: SampleQueryService
  ) {}

  ngOnInit() {
    this.queryStatusSubscription = this.sampleQueryService.queryStatus$.subscribe(
      status => this.queryStatus = status
    )
  }

  ngOnDestroy() {
    this.queryStatusSubscription.unsubscribe()
  }

}
