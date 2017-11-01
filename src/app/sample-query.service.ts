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
*/


import { SAMPLE_API_PATH, EXPERIMENT_API_PATH, STUDIES_PER_RESULTS_PAGE } from './CONFIG';

import { Injectable, OnDestroy } from '@angular/core';
import { Http, URLSearchParams }       from '@angular/http';
import { ActivatedRoute, ParamMap }   from '@angular/router';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription }   from 'rxjs/Subscription';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/filter'; // delete?
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import { TermLookupService } from './term-lookup.service'
import { SampleQuery, Term } from './sample-query'

// Tell the typescript compiler about google analytics
declare var ga: any;


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

  // Push a query given as an argument (used by the sample links)
  pushQuery(query: SampleQuery) {
    this.query.next(query);
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
  private updateUrlQueryString: Subscription = this.query$.subscribe(
    query => {
      let params:any = {};
      if (query.and.length) { params.and = query.and.map(term => term.ids[0]).join(',') }
      if (query.not.length) { params.not = query.not.map(term => term.ids[0]).join(',') }
      if (query.page > 1) { params.page = query.page }
      if (query.sampleType) { params.sampletype = query.sampleType }

      // Record that the next Query Param change should be ignored, eg currentQuery is
      // already up to date and we don't need to parse the state of the URL params
      // for the next param change caused by router.navigate().
      this.setQueryParamDebounceFlag();

      this.router.navigate([''], {
        queryParams: params,
        relativeTo: this.route
      })
    }
  )

  // When the page is first loaded, this function is called to parse a query
  // out of the URL parameters.
  private parseQueryFromUrlParams(params: ParamMap): SampleQuery {
    let query = new SampleQuery()

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


    if (params.get('page')) { query.page = +(params.get('page')) }

    if (params.get('sampletype')) { query.sampleType = params.get('sampletype') }

    return query
  }

  private initQueryFromUrl(): void {
    // When the page first loads, construct the first query from the URL parameters.
    this.currentQuery = this.parseQueryFromUrlParams(this.route.snapshot.queryParamMap)
    this.query.next(this.currentQuery)
  }



  // GROSS HACK: This is to prevent circular calls of state-changes changing the URL,
  // then in tern changing the state, causing unneccesary API calls.  I can't find a good
  // way to distinguish between back/forward presses and programmatic navigation state-changes
  // in Angular's routing API, so this waits to see if a certain number of miliseconds have
  // passed between the query-param change and the last programmatic navigation action to
  // determine if this was a user-generated action.  (A boolean flag doesn't work because
  // the queryParams observable doesn't fire for every navigation action.)
  private debounceThresholdMS = 30; // milliseconds
  private queryParamUpdateTimestamp = 0;
  private setQueryParamDebounceFlag(): void {
    this.queryParamUpdateTimestamp = Date.now();
  }


  // Subscribe to URL query parameter changes to detect forward/back presses, using
  // a time-debounce (see above) to distinguish from programmatic navigation actions.
  private queryParamSubscription = this.route.queryParams.subscribe((params) => {
    console.log(params);
    if (Date.now() - this.queryParamUpdateTimestamp > this.debounceThresholdMS) {
      this.initQueryFromUrl();
    }
  })




  // Observable keeping track of query validity/loading/error/complete status,
  // and used for passing query results to components.
  queryStatus$: Observable<QueryStatus> = this.query$
        .switchMap(query => query.isEmpty()
          ? Observable.of<QueryStatus>({validQuery: false, loading: false, results: null})
          : this.lookupResults(query)
        )

        // So multiple subscriptions don't cause redundant HTTP requests
        .share()



  // Given a query, construct a URL and hit the API server to fetch samples.
  // Returns an Observable<QueryStatus>, which first issues a loading flag
  // and then issues the query results once the request returns from the server.
  private lookupResults(query: SampleQuery): Observable<QueryStatus> {
    // Put together query string to send to server
    let params: URLSearchParams = new URLSearchParams()
    if (query.and.length) { params.set('and', query.and.map(term => term.ids[0]).join(',')) }
    if (query.not.length) { params.set('not', query.not.map(term => term.ids[0]).join(',')) }
    if (query.sampleType) { params.set('sampletype', query.sampleType) }

    // Calculate skip and limit for paging
    params.set('skip', String(STUDIES_PER_RESULTS_PAGE * (query.page - 1)))
    params.set('limit', String(STUDIES_PER_RESULTS_PAGE))

    // Google Analytics
    ga('send', 'pageview', SAMPLE_API_PATH + '?' + params.toString())

    // Hit the server, issue a QueryStatus object when the request returns.
    return this.http.get(SAMPLE_API_PATH, {search: params})
      .map(response => ({
        validQuery: true,
        loading: false,
        results: response.json() as QueryResults
      }))

      // Issue loading message
      .startWith({validQuery: true, loading: true, results:null})

      .catch(() => Observable.of({validQuery: true, loading: false, results:{
        error: 'We had a problem processing your search.  Please check your network connection, refresh the page, or try again later.'
      }}))
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




  downloadURL(query: SampleQuery, resource:string, extension: string): string {
    let params: URLSearchParams = new URLSearchParams()
    if (query.and.length) { params.set('and', query.and.map(term => term.ids[0]).join(',')) }
    if (query.not.length) { params.set('not', query.not.map(term => term.ids[0]).join(',')) }
    if (query.sampleType) { params.set('sampletype', query.sampleType) }

    let path: string = {
      'samples': SAMPLE_API_PATH,
      'experiments': EXPERIMENT_API_PATH
    }[resource]

    return (path + '.' + extension + '?' + params.toString());
  }





  // Clean up: unsibscribe from observables when service is destroyed.
  ngOnDestroy() {
    this.currentQueryUpdater.unsubscribe()
    this.updateUrlQueryString.unsubscribe()
    this.queryParamSubscription.unsubscribe()
  }







  // Methods for updating query parameters

  updateSampleType(sampleType: string|null): void {
    this.currentQuery.sampleType = sampleType || null; // Must be null instead of empty string for radio button to work
    this.currentQuery.page = 1;
    this.query.next(this.currentQuery);
  }

  updatePage(page: number): void {
    this.currentQuery.page = page;
    this.query.next(this.currentQuery);
  }



  updateANDTerms(terms: Term[]): void {
    this.currentQuery.and = terms;
    this.currentQuery.page = 1;
    this.query.next(this.currentQuery);
  }

  addANDTerm(term: Term): void {
    this.updateANDTerms(this.addTerm(term, this.currentQuery.and));
  }

  removeANDTerm(term: Term): void {
    this.updateANDTerms(this.removeTerm(term, this.currentQuery.and))
  }



  updateNOTTerms(terms: Term[]): void {
    this.currentQuery.not = terms;
    this.currentQuery.page = 1;
    this.query.next(this.currentQuery);
  }

  addNOTTerm(term: Term): void {
    this.updateNOTTerms(this.addTerm(term, this.currentQuery.not))
  }

  removeNOTTerm(term: Term): void {
    this.updateNOTTerms(this.removeTerm(term, this.currentQuery.not))
  }




  // Methods for manipulating lists of terms

  // Find the index of a term in a list of query terms.
  // If the term isn't in the list, return -1.
  // A term is a match if they have any ids in common.
  private indexOfTerm(term: Term, termList: Term[]): number {
    for (let i = 0; i < termList.length; i++) {
      for (let param_id of term.ids) {
        if (termList[i].ids.indexOf(param_id) > -1) return i;
      }
    }
    return -1;
  }

  // Given a term and a list of terms, add the term if it's not already in the list.
  // Modifies the array passed as termList, and returns the new array.
  addTerm(term: Term, termList: Term[]): Term[] {
    if (this.indexOfTerm(term, termList) == -1) {
      termList.push(term);
    }
    return termList
  }

  // Given a term and a terms list, return the list with the term removed if it
  // is present.  This also modifies the array passe in the termsList parameter.
  removeTerm(term: Term, termsList: Term[]): Term[] {
    let i = this.indexOfTerm(term, termsList);
    if (i > -1) {
      termsList.splice(i, 1);
    }
    return termsList;
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
  dterms: Term[]; // d for display
  samples: string[];
  attr: string[][];
  type: SampleType;
}

export class Sample {
  id: string;
  name: string | null | undefined;
}

export class SampleType {
  type: string;
  conf: number; // confidence
}
