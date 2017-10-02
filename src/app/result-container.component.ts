

import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';

import { Subscription } from 'rxjs/Subscription'

import { SampleQueryService, QueryStatus } from './sample-query.service'
import { SampleQuery } from './sample-query'

import { STUDIES_PER_RESULTS_PAGE } from './CONFIG'

@Component({
  moduleId: module.id,
  selector: 'sample-list',
  templateUrl: 'sample-list.component.html',
  styleUrls: ['sample-list.component.css']
})
export class SampleListComponent implements OnInit, OnDestroy{

  private sampleQuery: SampleQuery = this.sampleQueryService.getCurrentQuery();
  private sampleQuerySubscription: Subscription = this.sampleQueryService.query$.subscribe(
    query => { this.sampleQuery = query; }
  )

  private queryStatus: QueryStatus = this.sampleQueryService.getCurrentQueryStatus();
  private queryStatusSubscription: Subscription;

  // So it's accessible to the pagniation widget
  private STUDIES_PER_RESULTS_PAGE = STUDIES_PER_RESULTS_PAGE

  private pageChange(page: number): void {
    this.sampleQueryService.updatePage(page);
    this.elRef.nativeElement.scrollIntoView({behavior: 'smooth'});
  }

  constructor(
    private sampleQueryService: SampleQueryService,
    private elRef: ElementRef
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
