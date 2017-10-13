// This class uniquely represents a query against the set of samples, including
// all of the parameters that the user can enter.

export class SampleQuery {
  and: Term[];
  not: Term[];
  sampleType: string;
  page: number;

  // Start at page 1, there is no page 0
  constructor(props: any) {
    this.and = [];
    this.not = [];
    this.page = 1;
    this.sampleType = null; // this must be null instead of undefined for radio buttons

    // If we got an object passed in the contrusctor, assign all its props to
    // this SampleQuery instance.
    if (props) { Object.assign(this, props) }
  }

  // This is used to avoid hitting the server if the user has deleted all the
  // terms from the query.
  isEmpty(): boolean {
    // in Javascript an empty string is false
    return !(this.and.length || this.not.length)
  }
}



export class Term {
  ids: string[];
  name: string | null;

  syn: string | null | undefined; // synonyms
  ancestors: Term[] | null | undefined; // ancestor terms
  descendents: Term[] | null | undefined;

  constructor(ids: string[]) {
    this.ids = ids;
  }
}
