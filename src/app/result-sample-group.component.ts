
import { Component, Input } from '@angular/core';

import { SampleGroup } from './sample-query.service'
import { ClosePopoverService } from './close-popover.service'

@Component({
  moduleId: module.id,
  selector: 'result-sample-group',
  templateUrl: 'result-sample-group.component.html',
  styleUrls: ['result-sample-group.component.css']
})
export class ResultSampleGroupComponent {

  @Input()
  sampleGroup: SampleGroup;

  private INITIAL_SAMPLE_DISPLAY = 3
  private samplesExpanded = false;

  constructor(
    private closePopoverService: ClosePopoverService
  ) {}

  expandSamples(): void {
    this.samplesExpanded = true
  }

}
