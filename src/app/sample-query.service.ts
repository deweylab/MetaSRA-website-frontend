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


import { STUDIES_PER_RESULTS_PAGE } from './CONFIG'

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

import { TermLookupService } from './term-lookup.service'
import { SampleQuery, Term } from './sample-query'




@Injectable()
export class SampleQueryService implements OnDestroy {


  // Injected services
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http,
    private termLookupService: TermLookupService
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





  // Fired shortly after the page loads, if we need to look up names of ontology
  // terms from the server.  The results shouldn't subscribe to this because the
  // actual query doesn't change, but the search-controls should subscribe to this
  // because we now have the term names.
  //
  // There is a bit of a race condition here where there will be a problem if
  // the user does a search before the request comes back, but I think this is
  // pretty unlikely to be a noticable problem.
  private termInfoUpdate = new Subject<SampleQuery>();
  termInfoUpdate$ = this.termInfoUpdate.asObservable()




  // Subscription to query$ to keep the URL query string updated.
  // TODO: add sample type (and page number?)
  private updateUrlQueryString: Subscription = this.query$.subscribe(
    query => {
      let params:any = {};
      if (query.and.length) { params.and = query.and.map(term => term.ids[0]).join(',') }
      if (query.not.length) { params.not = query.not.map(term => term.ids[0]).join(',') }
      if (query.page > 1) { params.page = query.page }

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
    // TODO

    if (params.get('and')) {
      // Intialize terms with only ID's for now
      query.and = params.get('and').split(',').map(id => new Term([id]))

      // Look up term names, and when it comes back from the server issue
      // a termsInfoUpdate event.
      this.termLookupService.lookup(params.get('and'))
        .subscribe(terms => {
          this.currentQuery.and = terms;
          this.termInfoUpdate.next(this.currentQuery)
        })
    }

    if (params.get('not')) {
      // Initialize terms with only ID's for now
      query.not = params.get('not').split(',').map(id => new Term([id]))

      // Look up term names, and when it comes back from the server issue
      // a termsInfoUpdate event.
      this.termLookupService.lookup(params.get('not'))
        .subscribe(terms => {
          this.currentQuery.not = terms;
          this.termInfoUpdate.next(this.currentQuery)
        })
    }

    //query.and = params.get('and')
    //query.not = params.get('not')
    if (params.get('page')) { query.page = +(params.get('page')) }
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
    if (query.and) { params.set('and', query.and.map(term => term.ids[0]).join(',')) }
    if (query.not) { params.set('not', query.not.map(term => term.ids[0]).join(',')) }

    // Calculate skip and limit for paging
    params.set('skip', String(STUDIES_PER_RESULTS_PAGE * (query.page - 1)))
    params.set('limit', String(STUDIES_PER_RESULTS_PAGE))

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

  updateANDTerms(terms: Term[]): void {
    this.currentQuery.and = terms;
    this.currentQuery.page = 1;
    this.query.next(this.currentQuery);
  }

  updateNOTTerms(terms: Term[]): void {
    this.currentQuery.not = terms;
    this.currentQuery.page = 1;
    this.query.next(this.currentQuery);
  }

  updatePage(page: number): void {
    this.currentQuery.page = page;
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
  studyCount: null | undefined | number;
  error: null | undefined | string;
}

export class ResultStudy {
  id: string;
  title: string;
  samplegroups: any[];
}

export class SampleGroup {
  dterms: string[][]; // d for display
  samples: string[];
  attr: string[][];
}

export class Sample {
  id: string;
  type: SampleType;
  name: string | null | undefined;
}

export class SampleType {
  type: string;
  conf: number; // confidence
}
