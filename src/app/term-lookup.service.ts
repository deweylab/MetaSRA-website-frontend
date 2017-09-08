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
  

  // Lookup terms by search string
  search(q: string): Observable<Term[]> {
    return this.http
            .get(`/api/v01/terms?q=${q}`)
            .map(response => response.json().terms as Term[]);
  }


  // Lookup terms by ID
  lookup(id: string | string[]): Observable<Term[]> {

    // Join terms together if they're a list of arrays
    let idArg = typeof id === 'string' ? id : id.join(',')

    return this.http
        .get(`/api/v01/terms?id=${idArg}`)
        .map(response => response.json().terms as Term[])
  }

}
