/*
 * Create Triples Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param headers  - the output of your heaaders plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an array of triples
 */
function createTriples(id, content, headers, options) {
  return [ 
    sem.triple(sem.iri('final:'+id), sem.iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), sem.iri("http://www.w3.org/ns/prov#Entity")),
    sem.triple(sem.iri('final:'+id), sem.iri("http://www.w3.org/ns/prov#wasGeneratedBy"), sem.iri(options.flow)),
    sem.triple(sem.iri('final:'+id), sem.iri("http://www.w3.org/ns/prov#generatedAtTime"), fn.currentDateTime()),
    sem.triple(sem.iri('final:'+id), sem.iri("http://www.w3.org/ns/prov#wasDerivedFrom"), sem.iri('source:'+id))
  ]
}

module.exports = {
  createTriples: createTriples
};

