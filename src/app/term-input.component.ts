/**
Term input widget, with a set of terms which can be removed, and a text box
which uses autocomplete to add new terms.
*/

import { Component, Input, Output, EventEmitter } from '@angular/core';

import { TermLookupService } from './term-lookup.service'
import { Term } from './sample-query'

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
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
  public terms: Term[] = [];

  @Output()
  termAdd: EventEmitter<any> = new EventEmitter();

  @Output()
  termRemove: EventEmitter<any> = new EventEmitter();

  addTerm(term: Term): void {
    this.termAdd.emit({term: term})
  }

  removeTerm(term: Term): void {
    this.termRemove.emit({term: term})
  }


  // Keep track of the top term in the returned search results; to add if the user
  // presses enter.  If the search was empty, it might be {emptySearchPlaceholder:true.}
  topTerm: Term | any = null;

  constructor(
    private termLookupService: TermLookupService,
  ) {}


  // Called when one of the term buttons in the autocomplete is clicked
  private selectTerm(term: Term, searchBoxElement: any): void {
    this.addTerm(term);
    searchBoxElement.value = '';
  }


  // Fire an 'input' event when the text box is focused, to trigger the autocomplete.
  private textBoxFocus(e: Event): void {
    e.stopPropagation()
    setTimeout(() => {
        const inputEvent: Event = new Event('input');
        e.target.dispatchEvent(inputEvent);
    }, 0);
  }


  // Select the top term on enter key press
  private handleKeyUp(e: KeyboardEvent): void {
    if (e.keyCode == 13) {
      if (this.topTerm && !this.topTerm.emptySearchPlaceholder) {
        this.selectTerm(this.topTerm, e.target);
      }
    }
  }


  search = (text$: Observable<string>) =>
    text$
      .debounceTime(300)
      .distinctUntilChanged()
      //.do(() => this.searching = true)
      //.do(() => this.topTerm = null)
      .switchMap(inputText => {
        // Wait for at least 2 characters
        if (inputText.length >= 2) {
          return this.termLookupService.search(inputText)
            //.do(() => this.searchFailed = false)

            // If the search returned an empty list, populate the empty list with
            // a 'emptySearchPlaceholder: true' object.
            .map((result) => result.length ? result : [{emptySearchPlaceholder: true}])

            // Keep track of top term to use when the user presses the enter key.
            .do((result) => this.topTerm = result[0])

            .catch(() => {
              //this.searchFailed = true;
              this.topTerm = null;
              return Observable.of([{errorPlaceholder: true}]);
            })
        }
        else {
          // 0 or 1 characters in the query
          this.topTerm = null;
          return Observable.of([]);
        }

      })

          //.do(() => this.searching = false)
      //.merge(this.hideSearchingWhenUnsubscribed);
}
