
import { Component, Input } from '@angular/core';

import { ResultStudy } from './sample-query.service'

@Component({
  moduleId: module.id,
  selector: 'result-study',
  templateUrl: 'result-study.component.html',
  styleUrls: ['result-study.component.css']
})
export class ResultStudyComponent {

  @Input()
  study: ResultStudy;

  // Sample groups hidden until the user clicks "view samples" and then sampleGroupsVisible
  // is set to true.  The first X number of sample groups are show, until the user clicks
  // "see all samples" and then sampleGroupsExpanded becomes true and all are shown.
  private sampleGroupsVisible = false;
  private INITIAL_SAMPLEGROUP_DISPLAY = 3;
  private sampleGroupsExpanded = false;

  // Show the first INITIAL_SAMPLEGROUP_DISPLAY sample groups
  showSampleGroups(): void {
    this.sampleGroupsVisible = true;
  }

  // Show all samples
  expandSampleGroups(): void {
    this.sampleGroupsExpanded = true;
  }

  // Reset the sample-display state
  hideSampleGroups(elRef?: Element): void {
    this.sampleGroupsVisible = false;
    this.sampleGroupsExpanded = false;

    // If we were passed an element reference (the study box div), scroll to that element.
    if (elRef) {
      elRef.scrollIntoView();
    }
  }

}
