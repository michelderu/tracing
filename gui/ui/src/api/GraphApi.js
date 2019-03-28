import { polyfill } from 'es6-promise';
import 'isomorphic-fetch';

polyfill();

var api = '/v1/graphs/sparql';

function buildUrl(path, params) {
  var url = new URL(api + path, window.location.href);
  if (params) {
    Object.keys(params).forEach(key => {
      if (Array.isArray(params[key])) {
        params[key].map(param => url.searchParams.append(key, param))
      } else {
      url.searchParams.append(key, params[key])
      }
    });
  }
  return url;
}

function sparql(query, bindings) {
  console.log("query:"+query+", bindings:"+bindings);
  var params = bindings;
  var body = query;
  return fetch(buildUrl('', params), {
    method: 'POST',
    headers: {
      'content-type': 'application/sparql-query',
      accept: 'application/sparql-results+json'
    },
    body: body,
    credentials: 'same-origin'
  }).then(
    response => {
      return response.json();
    },
    error => {
      return error;
    }
  );

};

function toLabel(iri) {
  return iri.replace(/^(.*[\/#])?([^\/#]+)$/, '$2');
}

var nodes, edges;

export default {
  name: 'GraphApi',
  expand(iris) {
    console.log('IRIs:' + iris);
    if (!iris || !iris.length) {
      return new Promise(resolve => ({ nodes: [], edges: [] }));
    }

    nodes = nodes || {};
    edges = edges || {};

    var semIris = iris.filter(function(iri) { return (iri.substring(0,4) === 'http') || (iri.substring(0,1) === '/'); });
    var strIris = iris.filter(function(iri) { return iri.substring(0,4) !== 'http' && (iri.substring(0,1) !== '/'); });
    var bindings = {
      'bind:subjects': strIris,
      'bind:revSubjects': strIris
      //'bind:subjects:string': strIris,
      //'bind:revSubjects:string': strIris
    };

    iris.forEach(function(iri) {
      nodes[iri] = {
        id: iri,
        label: toLabel(iri)
      };
    });

    return sparql(' \
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n\
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n\
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n\
      PREFIX ssw: <http://schema.semantic-web.at/ppt/> \n\
      PREFIX prov: <http://www.w3.org/ns/prov#>\n\
      SELECT DISTINCT \n\
        ?subjectIri \n\
        ?predicateIri \n\
        ?predicateType \n\
        (COALESCE(?predicateLabel, ?predicateSkosLabel, ?predicateType, ?predicateIri) AS ?predicate) \n\
        ?objectIri \n\
      WHERE { \n\
        { \n\
          # forward links \n\
          ?subjectIri ?predicateIri ?objectIri . \n\
          FILTER( ?subjectIri = ?subjects ) \n\
          #FILTER( ?objectIri = ?revSubjects ) \n\
        } \n\
        UNION { \n\
          # reverse links \n\
          ?objectIri ?predicateIri ?subjectIri . \n\
          FILTER( ?subjectIri = ?revSubjects ) \n\
          #FILTER( ?objectIri = ?subjects ) \n\
        } \n\
        UNION { \n\
          # activity information\n\
          ?subjectIri prov:used ?docIri .\n\
          ?subjectIri ?predicateIri ?objectIri\n\
          FILTER( ?docIri = ?subjects )\n\
          FILTER (?predicateIri = prov:endedAtTime || ?predicateIri = prov:startedAtTime)\n\
        } \n\
        UNION { \n\
          # activity information\n\
          ?subjectIri prov:used ?docIri .\n\
          ?subjectIri ?predicateIri ?objectIri\n\
          FILTER( ?docIri = ?subjects )\n\
          FILTER (?predicateIri = rdf:type)\n\
        } \n\
        UNION {  \n\
          # derived information \n\
          ?docIri prov:wasDerivedFrom ?objectIri . \n\
          ?objectIri ?predicateIri ?subjectIri \n\
          FILTER( ?docIri = ?subjects ) \n\
        } \n\
        UNION {   \n\
          # Agent information \n\
          ?subjectIri prov:used ?docIri . \n\
          ?subjectIri ?predicateIri ?objectIri \n\
          FILTER( ?docIri = ?subjects ) \n\
          FILTER (?predicateIri = prov:wasAssociatedWith) \n\
        } \n\
        UNION {   \n\
          # Agent information \n\
          ?objectIri ?predicateIri ?subjectIri . \n\
          FILTER( ?subjectIri = ?subjects ) \n\
          FILTER (?predicateIri = prov:wasAttributedTo) \n\
        }   \n\
        OPTIONAL { \n\
          ?predicateIri rdfs:label ?predicateLabel . \n\
        } \n\
        OPTIONAL { \n\
          ?predicateIri skos:prefLabel ?predicateSkosLabel . \n\
        } \n\
        OPTIONAL { \n\
          ?predicateIri a ?predicateType . \n\
        } \n\
        FILTER( !(?predicateIri = (rdf:type, ssw:propagateType, skos:broader, skos:narrower, rdfs:label, skos:prefLabel, skos:altLabel)) ) \n\
        FILTER( ISIRI(?subjectIri) )\n\
      } LIMIT ' + iris.length + '00 \n\
    ', bindings).then(function(response) {

      response.results.bindings.forEach(function(binding) {
        var fromId = binding.subjectIri.value;
        var toId = binding.objectIri.value;
        var predicateId = binding.predicateIri.value;
        var predicateGroup = binding.predicateType ? binding.predicateType.value : 'unknown';
        var predicateLabel = toLabel(binding.predicate.value);

        if (!nodes[fromId]) {
          nodes[fromId] = {
            id: fromId,
            label: toLabel(fromId),
            group: 'unknown'
          };
        }

        if (!nodes[toId]) {
          nodes[toId] = {
            id: toId,
            label: toLabel(toId),
            group: 'unknown'
          };
        }

        var edgeId = fromId + '-' + predicateId + '-' + toId;
        edges[edgeId] = {
          id: edgeId,
          label: predicateLabel,
          group: predicateGroup,
          from: fromId,
          to: toId
        };
      });

    var iris = Object.keys(nodes);
    var semIris = iris.filter(function(iri) { return (iri.substring(0,4) === 'http') || (iri.substring(0,1) === '/') || true; });
    var strIris = iris.filter(function(iri) { return iri.substring(0,4) !== 'http' && (iri.substring(0,1) !== '/'); });
    console.log("semIris:"+semIris+", strIris:"+strIris);
    var bindings = {
      'bind:subjects': strIris
      //'bind:subjects:string': strIris
    }

      // jshint multistr: true
      return sparql(' \
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n\
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n\
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n\
        PREFIX ssw: <http://schema.semantic-web.at/ppt/> \n\
        PREFIX prov: <http://www.w3.org/ns/prov#>\n\
        SELECT DISTINCT \n\
          ?subjectIri \n\
          (COALESCE(?subjectSkosType1, ?subjectSkosType2, ?subjectSkosType3, ?subjectSkosType4, ?subjectSkosType5, ?subjectSkosType6, ?subjectRdfType) AS ?subjectType) \n\
          (COALESCE(?subjectLabel, ?subjectSkosLabel, ?subjectIri) AS ?subject) \n\
        WHERE { \n\
          { \n\
            ?subjectIri ?p ?o. \n\
          } UNION { \n\
            ?o ?p ?subjectIri. \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri a ?subjectRdfType . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri rdfs:label ?subjectLabel . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:prefLabel ?subjectSkosLabel . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri ssw:propagateType ?subjectSkosType1 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/ssw:propagateType ?subjectSkosType2 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/skos:broader/ssw:propagateType ?subjectSkosType3 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/skos:broader/skos:broader/ssw:propagateType ?subjectSkosType4 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/skos:broader/skos:broader/skos:broader/ssw:propagateType ?subjectSkosType5 . \n\
          } \n\
          OPTIONAL { \n\
            ?subjectIri skos:broader/skos:broader/skos:broader/skos:broader/skos:broader/ssw:propagateType ?subjectSkosType6 . \n\
          } \n\
          FILTER( ?subjectIri = ?subjects ) \n\
        } \n\
      ', bindings).then(function(response) {
        // jshint multistr: false

        response.results.bindings.forEach(function(binding) {
          var subjectId = binding.subjectIri.value;
          var subjectGroup = binding.subjectType ? binding.subjectType.value : 'unknown';
          subjectGroup = binding.subjectType && binding.subjectType.value.substring(0,4) == "2018" ? "xs:DateTime" : subjectGroup
          var subjectLabel = toLabel(binding.subject.value);

          if (!nodes[subjectId]) {
            nodes[subjectId] = {
              id: subjectId,
              label: subjectLabel,
              group: subjectGroup
            };
          } else {
            nodes[subjectId].label = subjectLabel;
            nodes[subjectId].group = subjectGroup;
          }

        });

        Object.keys(edges).forEach(function(key) {
          var edge = edges[key];
          nodes[edge.from].visibleLinks = (nodes[edge.from].visibleLinks || 0) + 1;
          nodes[edge.to].visibleLinks = (nodes[edge.to].visibleLinks || 0) + 1;
        });

    var iris = Object.keys(nodes);
    var semIris = iris.filter(function(iri) { return (iri.substring(0,4) === 'http') || (iri.substring(0,1) === '/'); });
    var strIris = iris.filter(function(iri) { return iri.substring(0,4) !== 'http' && (iri.substring(0,1) !== '/'); });
    var bindings = {
      'bind:subjects': strIris,
      'bind:revSubjects': strIris
      //'bind:subjects:string': strIris,
      //'bind:revSubjects:string': strIris
    }

        // jshint multistr: true
        return sparql(' \
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \n\
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> \n\
          PREFIX skos: <http://www.w3.org/2004/02/skos/core#> \n\
          PREFIX ssw: <http://schema.semantic-web.at/ppt/> \n\
          SELECT DISTINCT \n\
            ?subjectIri \n\
            (COUNT(?predicateIri) AS ?linkCount) \n\
          WHERE { \n\
            { \n\
              # forward links \n\
              ?subjectIri ?predicateIri ?objectIri . \n\
              FILTER( ?subjectIri = ?subjects ) \n\
            } \n\
            UNION { \n\
              # reverse links \n\
              ?objectIri ?predicateIri ?subjectIri . \n\
              FILTER( ?subjectIri = ?revSubjects ) \n\
            } \n\
            FILTER( !(?predicateIri = (rdf:type, ssw:propagateType, skos:broader, skos:narrower, rdfs:label, skos:prefLabel, skos:altLabel)) ) \n\
            FILTER( ISIRI(?objectIri) ) \n\
          } GROUP BY ?subjectIri \n\
        ', bindings).then(function(response) {
          // jshint multistr: false

          response.results.bindings.forEach(function(binding) {
            var subjectId = binding.subjectIri.value;
            var linkCount = + binding.linkCount.value;

            var node = nodes[subjectId];

            if (node && node.group == "unknown") {
              if (node.id && node.id.substring(0,4) == "2018") {
                node = nodes[subjectId] = {
                  id: subjectId,
                  label: toLabel(subjectId),
                  group: 'xs:DateTime',
                  totalLinks: linkCount
                };
              }
            }

            if (!node) {
              node = nodes[subjectId] = {
                id: subjectId,
                label: toLabel(subjectId),
                group: 'unknown',
                totalLinks: linkCount
              };
            } else {
              node.totalLinks = linkCount;
            }

            if (node.totalLinks) {
              // node.orbs = node.orbs || {};
              // node.orbs.NE = {
              //   label: node.totalLinks
              // };
            }
            if (node.visibleLinks) {
              // node.orbs = node.orbs || {};
              // node.orbs.NW = {
              //   label: node.visibleLinks
              // };
              var nodeSize = 20 + Math.log10(node.visibleLinks) * 40;
              node.icon = { size: nodeSize };
            }
          });

          return {
            nodes: Object.values(nodes),
            edges: Object.values(edges)
          };
        });
      });
    });
  }
};
