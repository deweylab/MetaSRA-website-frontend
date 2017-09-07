// Accesses the 'term' API resource for term autocomplete.
// TODO: put the API URL in a config file.
// TODO: add error handling

import { Injectable } from '@angular/core';
import { Http }       from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { Term } from './sample-query';

@Injectable()
export class TermLookupService {

  constructor(
    private http: Http,
  ) {}

  search(q: string): Observable<Term[]> {
    return this.http
            .get(`/api/v01/terms?q=${q}`)
            .map(response => response.json().terms as Term[]);
  }

}
