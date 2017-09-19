
import { Component, Input, Output, EventEmitter } from '@angular/core';

import { TermLookupService } from './term-lookup.service'
import { Term } from './sample-query'

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
//import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
//import 'rxjs/add/operator/merge';

@Component({
  moduleId: module.id,
  selector: 'term-input',
  templateUrl: 'term-input.component.html',
  styleUrls: ['term-input.component.css']
})
export class TermInputComponent {

  @Output()
  termChange: EventEmitter<any> = new EventEmitter()

  @Input()
  public terms: Term[] = [];

  constructor(
    private termLookupService: TermLookupService,
  ) {}

  addTerm(term: Term): void {
    if (this.indexOfTerm(term) == -1) {
      this.terms.push(term);
      this.termChange.emit({terms: this.terms});
    }
  }

  removeTerm(term: Term): void {
    let i = this.indexOfTerm(term);
    if (i > -1) {
      this.terms.splice(i, 1);
      this.termChange.emit({terms: this.terms});
    }
  }

  // Find the index of a term in the list of entered terms.
  // If the term isn't in the list, return -1.
  // A term is a match if they have any ids in common.
  private indexOfTerm(term: Term): number {
    for (let i = 0; i < this.terms.length; i++) {
      for (let param_id of term.ids) {
        if (this.terms[i].ids.indexOf(param_id) > -1) return i;
      }
    }
    return -1;
  }

  // Called when one of the term buttons in the autocomplete is clicked
  private selectTerm(term: Term, searchBoxElement: any): void {
    this.addTerm(term);
    searchBoxElement.value = '';
  }


  search = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      //.do(() => this.searching = true)
      .switchMap(term =>
        this.termLookupService.search(term)
          //.do(() => this.searchFailed = false)
          .catch(() => {
            //this.searchFailed = true;
            return Observable.of([]);
          }))
      //.do(() => this.searching = false)
      //.merge(this.hideSearchingWhenUnsubscribed);
}
