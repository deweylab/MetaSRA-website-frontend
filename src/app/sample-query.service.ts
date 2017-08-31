import { Injectable, OnDestroy } from '@angular/core';
import { Http, URLSearchParams }       from '@angular/http';

import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { Subscription }   from 'rxjs/Subscription';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/distinctUntilChanged'; // delete?
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';



import { ActivatedRoute, ParamMap }   from '@angular/router';
import { Router } from '@angular/router';

import { SampleQuery } from './sample-query'

@Injectable()
export class SampleQueryService implements OnDestroy {

  // Event stream for queries against the sample database
  private query = new Subject<SampleQuery>();

  // Outside classes can subscribe to this event stream, but since it's an observable and not a subject, events can only be fired from inside this class.
  query$ = this.query.asObservable();

  // Keep track of the current query, so we can re-issue new queries by modififying
  // the previous one.
  private currentQuery: SampleQuery;
  private currentQueryUpdater: Subscription;

  // Return a shapshot of the current query.
  getCurrentQuery(): SampleQuery {
    return this.currentQuery;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: Http
  ) {
    // Keep the 'currentQuery' variable always up-to-date whenever we issue a new query
    this.currentQueryUpdater = this.query$.distinctUntilChanged().subscribe(
      query => { this.currentQuery = query; }
    );

    // When the page first loads, construct the first query from the URL parameters.
    this.currentQuery = this.parseQueryFromUrlParams(this.route.snapshot.queryParamMap)
    this.query.next(this.currentQuery)
  }

  // When the page is first loaded, this function is called to parse a query
  // out of the URL parameters.
  parseQueryFromUrlParams(params: ParamMap): SampleQuery {
    let query = new SampleQuery()
    query.and = params.get('and')
    query.not = params.get('not')

    return query
  }

  // When the search query changes, update the URL path accordingly.
  // TODO: add page number?
  updateUrlQueryString: Subscription = this.query$.subscribe(
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

  ngOnDestroy() {
    this.currentQueryUpdater.unsubscribe()
    this.updateUrlQueryString.unsubscribe()
  }


  updateANDTerms(val: string): void {
    this.currentQuery.and = val;
    this.query.next(this.currentQuery);
  }

  updateNOTTerms(val: string): void {
    this.currentQuery.not = val;
    this.query.next(this.currentQuery);
  }


  // TODO: put the API path in a config file
  // TODO: put together query URL and hit the server
  lookupResults(query: SampleQuery): Observable<QueryStatus> {
    let SAMPLE_API_PATH = '/api/v01/samples'

    let params: URLSearchParams = new URLSearchParams()
    if (query.and) { params.set('and', query.and) }
    if (query.not) { params.set('not', query.not) }

    return this.http.get(SAMPLE_API_PATH, {search: params})
      .map(response => ({
        validQuery: true,
        loading: false,
        results: response.json() as QueryResults
      }))

      // Issue loading message
      .startWith({validQuery: true, loading: true, results:null})

  }

  queryStatus$: Observable<QueryStatus> = this.query$
    .debounceTime(300)
    .switchMap(query => query.isEmpty()
      ? Observable.of<QueryStatus>({validQuery: false, loading: false, results: null})
      : this.lookupResults(query)
    )

}


export class QueryStatus {
  validQuery: boolean;
  loading: boolean;
  results: QueryResults | null | undefined;
}

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
