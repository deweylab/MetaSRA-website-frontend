import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject'
import { Subscription }   from 'rxjs/Subscription';

import { ActivatedRoute, ParamMap }   from '@angular/router';

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

  private urlParamsSubscription: Subscription;

  getCurrentQuery(): SampleQuery {
    return this.currentQuery;
  }

  constructor(
    private route: ActivatedRoute
  ) {
    // Keep the 'currentQuery' variable always up-to-date whenever we issue a new query
    this.currentQueryUpdater = this.query$.subscribe(
      query => { this.currentQuery = query; }
    );

    this.currentQuery = {and:'foo', not: 'bar'};
    // this.updateQueryFromUrlParams(this.route.snapshot.queryParamMap)
    this.urlParamsSubscription = this.route.queryParamMap.subscribe(params => this.updateQueryFromUrlParams(params))
  }

  updateQueryFromUrlParams(params: ParamMap): void {
    this.currentQuery.and = params.get('and');
    this.currentQuery.not = params.get('not');
    this.query.next(this.currentQuery);
  }

  ngOnDestroy() {
    this.currentQueryUpdater.unsubscribe()
    this.urlParamsSubscription.unsubscribe()
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
