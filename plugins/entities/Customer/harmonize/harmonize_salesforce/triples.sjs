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
/*  
  // Get all triples for the originating document
  let triples = sem.sparql('\
	SELECT ?p ?o\
	WHERE {\
  	<' + id + '> ?p ?o\
	}\
  ');
  
  // Construct new triples for the Final document
  let tripleArray = [];
  for (let triple of triples) {
    tripleArray.push(sem.triple(sem.iri('source:'+id), triple.p, triple.o));
  }
*/
  
  // Create provenance for this document
  let tripleArray = [];  
  tripleArray.push(sem.triple(sem.iri('final:'+id), sem.iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), sem.iri("http://www.w3.org/ns/prov#Entity")));
  tripleArray.push(sem.triple(sem.iri('final:'+id), sem.iri("http://www.w3.org/ns/prov#wasGeneratedBy"), sem.iri(options.flow)));
  tripleArray.push(sem.triple(sem.iri('final:'+id), sem.iri("http://www.w3.org/ns/prov#generatedAtTime"), fn.currentDateTime()));
  tripleArray.push(sem.triple(sem.iri('final:'+id), sem.iri("http://www.w3.org/ns/prov#wasDerivedFrom"), sem.iri('source:'+id)));
  
  return [tripleArray];
}

module.exports = {
  createTriples: createTriples
};

