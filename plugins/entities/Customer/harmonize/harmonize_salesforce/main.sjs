// dhf.sjs exposes helper functions to make your life easier
// See documentation at:
// https://marklogic.github.io/marklogic-data-hub/docs/server-side/
const dhf = require('/data-hub/4/dhf.sjs');

const contentPlugin = require('./content.sjs');
const headersPlugin = require('./headers.sjs');
const triplesPlugin = require('./triples.sjs');
const writerPlugin = require('./writer.sjs');

/*
 * Plugin Entry point
 *
 * @param id          - the identifier returned by the collector
 * @param options     - a map containing options. Options are sent from Java
 *
 */
function main(id, options) {
  
  // Register this flow as an Activity
  const sem = require("/MarkLogic/semantics.xqy");
  createTriple(sem.iri(options.flow), sem.iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), sem.iri("http://www.w3.org/ns/prov#Activity"));

  var contentContext = dhf.contentContext();
  var content = dhf.run(contentContext, function() {
    return contentPlugin.createContent(id, options);
  });

  var headerContext = dhf.headersContext(content);
  var headers = dhf.run(headerContext, function() {
    return headersPlugin.createHeaders(id, content, options);
  });

  var tripleContext = dhf.triplesContext(content, headers);
  var triples = dhf.run(tripleContext, function() {
    return triplesPlugin.createTriples(id, content, headers, options);
  });

  var envelope = dhf.makeEnvelope(content, headers, triples, options.dataFormat);

  // writers must be invoked this way.
  // see: https://github.com/marklogic/marklogic-data-hub/wiki/dhf-lib#run-writer
  dhf.runWriter(writerPlugin, id, envelope, options);
}

//
// Helper function to create ProvO triples using eval
//
function createTriple (object, predicate, subject)
{
  console.log ("Creating triple: " + object + ", " + predicate + ", " + subject)
  xdmp.eval("\
    const sem = require('/MarkLogic/semantics.xqy');\
    declareUpdate();\
    var object; var predicate; var subject;\
    sem.rdfInsert(sem.triple(object, predicate, subject));",
    ({"object":object,"predicate":predicate,"subject":subject})
  );
}

module.exports = {
  main: main
};
