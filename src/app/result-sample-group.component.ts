
import { Component, Input } from '@angular/core';

import { SampleGroup } from './sample-query.service'

@Component({
  moduleId: module.id,
  selector: 'result-sample-group',
  templateUrl: 'result-sample-group.component.html',
  styleUrls: ['result-sample-group.component.css']
})
export class ResultSampleGroupComponent {

  @Input()
  sampleGroup: SampleGroup;

}
