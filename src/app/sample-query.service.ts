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
TODO: add network/server error handling
*/


import { Injectable, OnDestroy } from '@angular/core';
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
import 'rxjs/add/operator/share'

import { SampleQuery } from './sample-query'




@Injectable()
export class SampleQueryService implements OnDestroy {


  // Injected services
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http
  ) {
    // When the page first loads, construct the first query from the URL parameters.
    this.initQueryFromUrl()
  }





  // Event stream for queries against the sample database
  private query = new Subject<SampleQuery>();

  // Outside classes can subscribe to this event stream, but since it's an
  // observable and not a subject, events can only be fired from inside this class.
  query$ = this.query.asObservable();

  // Keep track of the current query, so we can re-issue new queries by modififying
  // the previous one.
  // TODO: distinctUntilChanged is probably unneccesary
  private currentQuery: SampleQuery;
  private currentQueryUpdater: Subscription = this.query$.distinctUntilChanged().subscribe(
    query => { this.currentQuery = query; }
  );

  // Return a shapshot of the current query.
  getCurrentQuery(): SampleQuery {
    return this.currentQuery;
  }






  // Subscription to query$ to keep the URL query string updated.
  // TODO: add sample type (and page number?)
  private updateUrlQueryString: Subscription = this.query$.subscribe(
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

  // When the page is first loaded, this function is called to parse a query
  // out of the URL parameters.
  // TODO: add sample type (and page number?)
  private parseQueryFromUrlParams(params: ParamMap): SampleQuery {
    let query = new SampleQuery()
    query.and = params.get('and')
    query.not = params.get('not')
    return query
  }

  private initQueryFromUrl(): void {
    // When the page first loads, construct the first query from the URL parameters.
    this.currentQuery = this.parseQueryFromUrlParams(this.route.snapshot.queryParamMap)
    this.query.next(this.currentQuery)
  }





  // Observable keeping track of query validity/loading/error/complete status,
  // and used for passing query results to components.
  // TODO: remove debouncetime operator after implementing autocomplete
  queryStatus$: Observable<QueryStatus> = this.query$
        .debounceTime(300)
        .switchMap(query => query.isEmpty()
          ? Observable.of<QueryStatus>({validQuery: false, loading: false, results: null})
          : this.lookupResults(query)
        )

        // So multiple subscriptions don't cause redundant HTTP requests
        .share()


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


  // Keep track of the current query status and expose a method to access it.
  // (For page initialization.)
  private currentQueryStatus: QueryStatus;
  private queryStatusSubscription: Subscription = this.queryStatus$.subscribe(
    status => this.currentQueryStatus = status
  )
  getCurrentQueryStatus(): QueryStatus {
    return this.currentQueryStatus;
  }






  // Clean up: unsibscribe from observables when service is destroyed.
  ngOnDestroy() {
    this.currentQueryUpdater.unsubscribe()
    this.updateUrlQueryString.unsubscribe()
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
  studies: null | undefined | ResultStudy[];
  studycount: null | undefined | number;
  error: null | undefined | string;
}

export class ResultStudy {
  id: string;
  title: string;
  samplegroups: any[];
}
