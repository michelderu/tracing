function get(context, params) {
  // Register start time for provenance
  let startTime = fn.currentDateTime();

  // Get search parameter
  let query = params['q'];

  // Register this endpoint as an Activity
  const sem = require('/MarkLogic/semantics.xqy');
  let activityName = 'GetCustomer-'+ sem.uuidString();
  createTriple(sem.iri(activityName), sem.iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), sem.iri("http://www.w3.org/ns/prov#Activity"));
  // Set the start time
  createTriple(sem.iri(activityName), sem.iri("http://www.w3.org/ns/prov#startedAtTime"), startTime + "-S");
  // Register the current user as an Agent and link this Activity
  let currentUser = xdmp.getCurrentUser();
  createTriple(sem.iri(currentUser), sem.iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), sem.iri("http://www.w3.org/ns/prov#Agent"));
  createTriple(sem.iri(activityName), sem.iri("http://www.w3.org/ns/prov#wasAssociatedWith"), sem.iri(currentUser));

  // Get URIs of Customers
  let customerUris = cts.uris(null, null, cts.andQuery([cts.collectionQuery('Customer'), cts.wordQuery(query, null)]));

  // Construct an object with required data
  let results = [];
  for (customerUri of customerUris) {
    let customer = cts.doc(customerUri);
    results.push ({
      'id': customer.xpath('//Customer/id'), 
      'name': customer.xpath('//Customer/name'),
      'email': customer.xpath('//Customer/email')
      });
    // link the Activity to the Entity
    createTriple(sem.iri(activityName), sem.iri("http://www.w3.org/ns/prov#used"), sem.iri('final:'+customerUri));
    // Link the Activity to the current Agent
    createTriple(sem.iri('final:'+customerUri), sem.iri("http://www.w3.org/ns/prov#wasAttributedTo"), sem.iri(currentUser));
  }

  // Register end time for provenance
  let endTime = fn.currentDateTime();
  createTriple(sem.iri(activityName), sem.iri("http://www.w3.org/ns/prov#endedAtTime"), endTime + "-E");

  // Return the results in JSON format
  xdmp.setResponseContentType("application/json");
  return xdmp.toJSON(results);};

function post(context, params, input) {
  // return zero or more document nodes
};

function put(context, params, input) {
  // return at most one document node
};

function deleteFunction(context, params) {
  // return at most one document node
};

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

exports.GET = get;
exports.POST = post;
exports.PUT = put;
exports.DELETE = deleteFunction;
