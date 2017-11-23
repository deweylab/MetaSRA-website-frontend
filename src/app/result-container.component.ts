/**
This component renders the results of the sample query.

If there are valid sample results, this component renders the list of resulting
studies, as well as the download button, pager widget, and "X samples in Y studies."

Otherwise if there are no sample results, it will show messages for these states:
- The results are loading
- There is an error
- The user's query is empty (then show the examples.)
*/


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

  constructor(
    private sampleQueryService: SampleQueryService,
    private elRef: ElementRef,
    private closePopoverService: ClosePopoverService
  ) {}

  // Keep track of the sample query and query-status (which sometimes contains results)
  private sampleQuery: SampleQuery = this.sampleQueryService.getCurrentQuery();
  private sampleQuerySubscription: Subscription;

  private queryStatus: QueryStatus = this.sampleQueryService.getCurrentQueryStatus();
  private queryStatusSubscription: Subscription;

  // Set class members for these constants so they're accessible to the pagniation widget.
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

  ngOnInit() {
    // Update this component's copy of the query status when it changes.
    this.queryStatusSubscription = this.sampleQueryService.queryStatus$.subscribe(
      status => {
        this.termsListExpanded = false;
        this.queryStatus = status;
      }
    )

    // Update this component's copy of the query when it changes. 
    this.sampleQuerySubscription = this.sampleQueryService.query$.subscribe(
      query => { this.sampleQuery = query; }
    )
  }

  ngOnDestroy() {
    this.queryStatusSubscription.unsubscribe();
    this.sampleQuerySubscription.unsubscribe();
  }

}
