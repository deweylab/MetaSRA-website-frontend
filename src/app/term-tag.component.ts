
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { Observable } from 'rxjs/Observable'

import { ClosePopoverService } from './close-popover.service'
import { SampleQueryService } from './sample-query.service'
import { TermLookupService } from './term-lookup.service'
import { Term } from './sample-query'




@Component({
  moduleId: module.id,
  selector: 'term-tag',
  templateUrl: 'term-tag.component.html',
  styleUrls: ['term-tag.component.css'],
})
export class TermTagComponent {

  @Input()
  term: Term;

  @Output()
  termRemove: EventEmitter<any> = new EventEmitter();

  @Input()
  removeButton: boolean = false;

  @Input()
  buttonClasses: string = '';

  @Input()
  style: string = '';

  // This is null until lookupTerm is called, then the term info is fetched
  // from the server and this is filled in.
  expandedTerm: Term = null;

  constructor(
    private termLookupService: TermLookupService,
    private sampleQueryService: SampleQueryService,
    private closePopoverService: ClosePopoverService
  ) {}

  lookupTerm(): void {
    this.termLookupService.lookup(this.term.ids[0])
      .subscribe((results) => this.expandedTerm = results[0]);
  }

  closeClick(): void {
    if (this.termRemove) {
      this.termRemove.emit({term:this.term})
    }
  }

}
