// This class uniquely represents a query against the set of samples, including
// all of the parameters that the user can enter.

export class SampleQuery {
  and: Term[];
  not: Term[];
  page: number;

  // Start at page 1, there is no page 0
  constructor() {
    this.and = [];
    this.not = [];
    this.page = 1;
  }

  isEmpty(): boolean {
    // in Javascript an empty string is false
    return !(this.and || this.not)
  }
}



export class Term {
  id: string;
  name: string | null;

  syn: string | null | undefined; // synonyms
  up: Term[] | null | undefined; // ancestor terms
  down: Term[] | null | undefined;

  constructor(id: string) {
    this.id = id;
  }
}
