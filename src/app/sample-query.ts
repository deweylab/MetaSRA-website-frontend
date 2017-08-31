// This class uniquely represents a query against the set of samples, including
// all of the parameters that the user can enter.

export class SampleQuery {
  and: string;
  not: string;

  isEmpty(): boolean {
    // in Javascript an empty string is false
    return !(this.and || this.not)
  }
}
