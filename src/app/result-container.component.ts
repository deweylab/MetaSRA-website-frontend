

import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';

import { Subscription } from 'rxjs/Subscription'

import { SampleQueryService, QueryStatus } from './sample-query.service'
import { SampleQuery } from './sample-query'
import { ClosePopoverService } from './close-popover.service'

import { STUDIES_PER_RESULTS_PAGE, INITIAL_COMMON_TERM_COUNT } from './CONFIG'

@Component({
  moduleId: module.id,
  selector: 'result-container',
  templateUrl: 'result-container.component.html',
  styleUrls: ['result-container.component.css']
})
export class ResultContainerComponent implements OnInit, OnDestroy{

  private sampleQuery: SampleQuery = this.sampleQueryService.getCurrentQuery();
  private sampleQuerySubscription: Subscription;

  private queryStatus: QueryStatus = this.sampleQueryService.getCurrentQueryStatus();
  private queryStatusSubscription: Subscription;

  // So it's accessible to the pagniation widget
  private STUDIES_PER_RESULTS_PAGE = STUDIES_PER_RESULTS_PAGE;
  private INITIAL_COMMON_TERM_COUNT = INITIAL_COMMON_TERM_COUNT;

  private pageChange(page: number): void {
    this.sampleQueryService.updatePage(page);
    this.elRef.nativeElement.scrollIntoView({behavior: 'smooth'});
  }

  // Keep track of whether the user has clicked a link to show the full terms
  // list, otherwise truncate it.
  private termsListExpanded = false;
  private expandTerms() {
    this.termsListExpanded = true;
  }
  private collapseTerms() {
    this.termsListExpanded = false;
    this.elRef.nativeElement.scrollIntoView({behavior: 'smooth'});
  }

  private goToExample(queryProps: any): void {
    this.sampleQueryService.pushQuery(new SampleQuery(queryProps));
  }


  constructor(
    private sampleQueryService: SampleQueryService,
    private elRef: ElementRef,
    private closePopoverService: ClosePopoverService
  ) {}

  ngOnInit() {
    this.queryStatusSubscription = this.sampleQueryService.queryStatus$.subscribe(
      status => {
        this.termsListExpanded = false;
        this.queryStatus = status;
      }
    )

    this.sampleQuerySubscription = this.sampleQueryService.query$.subscribe(
      query => { this.sampleQuery = query; }
    )
  }

  ngOnDestroy() {
    this.queryStatusSubscription.unsubscribe()
  }

}
