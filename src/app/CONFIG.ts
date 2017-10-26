

// URL for the sample resource of the API, for searching samples
export const SAMPLE_API_PATH = '/api/v01/samples';

// Experiment resource (only used to generate download links)
export const EXPERIMENT_API_PATH = '/api/v01/experiments'

// API resource used by the autocomplete and term popups
export const TERM_API_PATH = '/api/v01/terms';



// Number of studies to show on each results page
export const STUDIES_PER_RESULTS_PAGE = 25


// The number of 'most common terms' to show before the user
// clicks the "Show all" button.
export const INITIAL_COMMON_TERM_COUNT = 30

export const SAMPLE_TYPES = [
  'cell line',
  'tissue',
  'primary cells',
  'stem cells',
  'in vitro differentiated cells',
  'iPS cell line'
]

export const ONTOLOGY_NAMES = {
  'UBERON': 'Uber Anatomy Ontology',
  'CL': 'Cell Ontology',
  'CVCL': 'Cellosaurus Cell Line Ontology',
  'EFO': 'Experimental Factor Ontology',
  'DOID': 'Disease Ontology'
}

export function term_link(termID: string): string {
  return {
    'EFO': () => 'http://www.ebi.ac.uk/ols/ontologies/efo/terms?short_form=' + termID.replace(':', '_'),
    'UBERON': () => 'http://www.ebi.ac.uk/ols/ontologies/uberon/terms?short_form=' + termID.replace(':', '_'),
    'CVCL': () => 'http://web.expasy.org/cellosaurus/' + termID.replace(':', '_'),
    'CL': () => 'http://www.ebi.ac.uk/ols/ontologies/cl/terms?short_form=' + termID.replace(':', '_'),
    'DOID': () => 'http://www.ebi.ac.uk/ols/ontologies/doid/terms?short_form=' + termID.replace(':', '_'),
  }[termID.split(':')[0]]();
}
//http://www.ebi.ac.uk/ols/ontologies/uberon/terms?iri=http://purl.obolibrary.org/obo/
