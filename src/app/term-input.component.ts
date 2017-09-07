
import { Component, Input } from '@angular/core';

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

  @Input()
  change: (terms: Term[]) => void = (terms) => null;

  @Input()
  public terms: Term[] = [];

  constructor(
    private termLookupService: TermLookupService,
  ) {}

  addTerm(term: Term): void {
    if (this.indexOfTerm(term) == -1) this.terms.push(term);
  }

  removeTerm(term: Term): void {
    let i = this.indexOfTerm(term);
    if (i > -1) this.terms.splice(i, 1);
  }

  // Find the index of a term in the list of entered terms.
  // If the term isn't in the list, return -1.
  private indexOfTerm(term: Term): number {
    for (let i = 0; i < this.terms.length; i++) {
      if (term.id == this.terms[i].id) return i;
    }
    return -1;
  }

  resultFormatter = (term: Term) => term.name;

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