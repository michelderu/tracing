'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, options) {
  let doc = cts.doc(id);

  let source;

  // for xml we need to use xpath
  if(doc && xdmp.nodeKind(doc) === 'element' && doc instanceof XMLDocument) {
    source = doc
  }
  // for json we need to return the instance
  else if(doc && doc instanceof Document) {
    source = fn.head(doc.root);
  }
  // for everything else
  else {
    source = doc;
  }

  return extractInstanceCustomer(source);
}
  
/**
* Creates an object instance from some source document.
* @param source  A document or node that contains
*   data for populating a Customer
* @return An object with extracted data and
*   metadata about the instance.
*/
function extractInstanceCustomer(source) {
  // the original source documents
  let attachments = source;
  // now check to see if we have XML or json, then create a node clone from the root of the instance
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/*:envelope/*:instance';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath += '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }
  /* These mappings were generated using mapping: map_salesforce, version: 2 on 2019-03-26T12:35:22.421311Z.*/
  let id = !fn.empty(fn.head(source.xpath('//id'))) ? xs.string(fn.head(fn.head(source.xpath('//id')))) : null;
  let fname = !fn.empty(fn.head(source.xpath('//first_name'))) ? xs.string(fn.head(fn.head(source.xpath('//first_name')))) : null;
  let lname = !fn.empty(fn.head(source.xpath('//last_name'))) ? xs.string(fn.head(fn.head(source.xpath('//last_name')))) : null;  
  let email = !fn.empty(fn.head(source.xpath('//email'))) ? xs.string(fn.head(fn.head(source.xpath('//email')))) : null;
  let upstream = 'salesforce';

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'Customer',
    '$version': '0.0.1',
    'id': id,
    'name': fname + ' ' + lname,
    'email': email,
    'upstream': upstream
  }
};


function makeReferenceObject(type, ref) {
  return {
    '$type': type,
    '$ref': ref
  };
}

module.exports = {
  createContent: createContent
};

