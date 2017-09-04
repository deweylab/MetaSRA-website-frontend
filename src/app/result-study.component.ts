
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

  private INITIAL_SAMPLEGROUP_DISPLAY = 3;
  private sampleGroupsExpanded = false;

  expandSampleGroups(): void {
    this.sampleGroupsExpanded = true;
  }

}
