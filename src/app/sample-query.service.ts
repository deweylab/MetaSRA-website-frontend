/*
This service handles mainly 2 things:
  1) query$: All the state of the query currently entered by the user (which
     terms they've entered, filters applied, current page, etc.)
  2) queryStatus$: (Query results.)  Each time the query changes, this service
     will hit the API to load the results.  Request status and results are
     passed via this observable.

It also handles the URL query string of the main application page: it changes
the URL when the user changes the query, and updates the application state from
the URL when the page first loads.

TODO: add other query parameters like page and sampletype.
*/


import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Http, URLSearchParams }       from '@angular/http';
import { ActivatedRoute, ParamMap }   from '@angular/router';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription }   from 'rxjs/Subscription';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/distinctUntilChanged'; // delete?
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

import { SampleQuery } from './sample-query'




@Injectable()
export class SampleQueryService implements OnInit, OnDestroy {

  // Injected services
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http
  ) {}

  // Event stream for queries against the sample database
  private query = new Subject<SampleQuery>();

  // Outside classes can subscribe to this event stream, but since it's an
  // observable and not a subject, events can only be fired from inside this class.
  query$ = this.query.asObservable();

  // Keep track of the current query, so we can re-issue new queries by modififying
  // the previous one.
  private currentQuery: SampleQuery;
  private currentQueryUpdater: Subscription;

  // Subscription to query$ to keep the URL query string updated
  private updateUrlQueryString: Subscription;

  // Observable keeping track of query validity/loading/error/complete status,
  // and used for passing query results to components.
  queryStatus$: Observable<QueryStatus>;


  ngOnInit() {
    // Keep the 'currentQuery' variable always up-to-date whenever we issue a new query
    // TODO: distinctUntilChanged is probably unneccesary
    this.currentQueryUpdater = this.query$.distinctUntilChanged().subscribe(
      query => { this.currentQuery = query; }
    );

    // When the search query changes, update the URL path accordingly.
    // TODO: add page number?
    this.updateUrlQueryString = this.query$.subscribe(
      query => {
        let params:any = {};
        if (query.and) { params.and = query.and }
        if (query.not) { params.not = query.not }

        this.router.navigate([''], {
          queryParams: params,
          relativeTo: this.route
        })
      }
    )

    // When the page first loads, construct the first query from the URL parameters.
    this.currentQuery = this.parseQueryFromUrlParams(this.route.snapshot.queryParamMap)
    this.query.next(this.currentQuery)

    this.queryStatus$ = this.query$
      .debounceTime(300)
      .switchMap(query => query.isEmpty()
        ? Observable.of<QueryStatus>({validQuery: false, loading: false, results: null})
        : this.lookupResults(query)
      )
  }

  // Clean up: unsibscribe from observables when service is destroyed.
  ngOnDestroy() {
    this.currentQueryUpdater.unsubscribe()
    this.updateUrlQueryString.unsubscribe()
  }




  // Return a shapshot of the current query.
  getCurrentQuery(): SampleQuery {
    return this.currentQuery;
  }

  // When the page is first loaded, this function is called to parse a query
  // out of the URL parameters.
  private parseQueryFromUrlParams(params: ParamMap): SampleQuery {
    let query = new SampleQuery()
    query.and = params.get('and')
    query.not = params.get('not')

    return query
  }

  // Given a query, construct a URL and hit the API server to fetch samples.
  // Returns an Observable<QueryStatus>, which first issues a loading flag
  // and then issues the query results once the request returns from the server.
  // TODO: put the API path in a config file
  // TODO: add error handling
  private lookupResults(query: SampleQuery): Observable<QueryStatus> {
    let SAMPLE_API_PATH = '/api/v01/samples'

    // Put together query string to send to server
    let params: URLSearchParams = new URLSearchParams()
    if (query.and) { params.set('and', query.and) }
    if (query.not) { params.set('not', query.not) }

    // Hit the server, issue a QueryStatus object when the request returns.
    return this.http.get(SAMPLE_API_PATH, {search: params})
      .map(response => ({
        validQuery: true,
        loading: false,
        results: response.json() as QueryResults
      }))

      // Issue loading message
      .startWith({validQuery: true, loading: true, results:null})
  }




  // Methods for updating sample type

  updateANDTerms(val: string): void {
    this.currentQuery.and = val;
    this.query.next(this.currentQuery);
  }

  updateNOTTerms(val: string): void {
    this.currentQuery.not = val;
    this.query.next(this.currentQuery);
  }

}



// Used for signaling query valid/loaded/complete status against API server.
export class QueryStatus {
  validQuery: boolean;
  loading: boolean;
  results: QueryResults | null | undefined;
}


// Nestable classes represening the structure of results returned by the server.

export class QueryResults {
  studies: null | undefined | Study[];
  count: null | undefined | number;
  error: null | undefined | string;
}

export class Study {
  id: string;
  title: string;
  samplegroups: any[];
}
