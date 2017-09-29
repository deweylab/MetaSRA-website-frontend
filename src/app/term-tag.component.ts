
import { Component, Input } from '@angular/core';


import { Observable } from 'rxjs/Observable'

import { TermLookupService } from './term-lookup.service'
import { Term } from './sample-query'

@Component({
  moduleId: module.id,
  selector: 'term-tag',
  templateUrl: 'term-tag.component.html',
  styleUrls: ['term-tag.component.css']
})
export class TermTagComponent {

  @Input()
  term: Term;

  @Input()
  onClose: ()=>void = null;

  @Input()
  classes: string = '';

  @Input()
  style: string = '';

  // This is null until lookupTerm is called, then the term info is fetched
  // from the server and this is filled in.
  expandedTerm: Term = null;

  constructor(
    private termLookupService: TermLookupService,
  ) {}

  lookupTerm(): void {
    this.termLookupService.lookup(this.term.ids[0])
      .subscribe((results) => this.expandedTerm = results[0]);
  }


}
