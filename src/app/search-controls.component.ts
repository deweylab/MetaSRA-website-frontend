/**
Renders form widgets for querying samples.

For the most part, this component does not have its own state but rather relies
on the SampleQueryService to maintain the state of the query.

The exception is for the sample type widget - to make sure the right option is
selected in the rendered HTML, we need to use ngModel which requries the selected
sample type to be a class member which we have to keep updated.
*/

import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription'

import { SampleQueryService } from './sample-query.service'
import { SampleQuery } from './sample-query'

import { SAMPLE_TYPES } from './CONFIG'

@Component({
  moduleId: module.id,
  selector: 'search-controls',
  templateUrl: 'search-controls.component.html',
  styleUrls: ['search-controls.component.css']
})
export class SearchControlsComponent implements OnDestroy {

  private sampleQuery: SampleQuery;
  private sampleQuerySubscripion: Subscription;
  private termInfoUpdateSubscription: Subscription;

  private sampleTypes = SAMPLE_TYPES;

  // The selected sample type is split out into a separate variable so we can
  // use it with ngForms to keep the radio button state updated.  (This is a
  // bit tedious to keep updated, but there's no other way to
  // set the value of the ngbRadioGroup.)
  private selectedSampleType: string;

  constructor(
    private sampleQueryService: SampleQueryService
  ) {
    this.sampleQuery = this.sampleQueryService.getCurrentQuery();
    this.selectedSampleType = this.sampleQuery.sampleType

    this.sampleQuerySubscripion = this.sampleQueryService.query$.subscribe(
      query => { this.sampleQuery = query; this.selectedSampleType = query.sampleType }
    )

    // This observable may be triggered right after the page loads, to update
    // term names from the ID's in the URL query string.  It's a separate observable
    // because we don't want to change the results, only the display of the query
    // terms.
    this.termInfoUpdateSubscription = this.sampleQueryService.termInfoUpdate$.subscribe(
      query => { this.sampleQuery = query; this.selectedSampleType = query.sampleType }
    )


    // Make the logo clickable to reset query
    document.getElementById('logo-big').addEventListener('click', ()=>this.sampleQueryService.resetQuery())
  }

  ngOnDestroy() {
    this.sampleQuerySubscripion.unsubscribe();
  }


}
