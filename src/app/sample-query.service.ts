import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject'
import { Subscription }   from 'rxjs/Subscription';
import 'rxjs/add/operator/distinctUntilChanged';

import { ActivatedRoute, ParamMap }   from '@angular/router';
import { Router } from '@angular/router';

import { SampleQuery } from './samplequery'

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

  getCurrentQuery(): SampleQuery {
    return this.currentQuery;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Keep the 'currentQuery' variable always up-to-date whenever we issue a new query
    this.currentQueryUpdater = this.query$.distinctUntilChanged().subscribe(
      query => { this.currentQuery = query; }
    );

    this.currentQuery = this.parseQueryFromUrlParams(this.route.snapshot.queryParamMap)
    this.query.next(this.currentQuery)
  }

  parseQueryFromUrlParams(params: ParamMap): SampleQuery {
    return {
      and: params.get('and'),
      not: params.get('not')
    }
  }

  // When the search query changes, update the URL path accordingly.
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
}
