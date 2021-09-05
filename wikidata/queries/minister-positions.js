const fs = require('fs');
let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = function () {
  return `SELECT DISTINCT ?item ?itemLabel ?itemDescription ?inception ?abolition
                  ?partOf ?partOfLabel ?partStart ?partEnd
                  ?isa ?isaLabel ?ministry ?ministryLabel
  WHERE {
    ?item wdt:P279* wd:Q83307 ; wdt:P1001 wd:${meta.jurisdiction.id} .
    OPTIONAL {
      ?item          p:P361  ?partStatement .
      ?partStatement ps:P361 ?partOf .
      OPTIONAL { ?partStatement pq:P580 ?partStart }
      OPTIONAL { ?partStatement pq:P582 ?partEnd   }
    }
    OPTIONAL { ?item wdt:P571 ?inception }
    OPTIONAL { ?item wdt:P576 ?abolition }
    OPTIONAL { ?item wdt:P279 ?isa       }
    OPTIONAL { ?item wdt:P2389 ?ministry }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  }
  ORDER BY ?itemLabel ?inception ?isa`
}
