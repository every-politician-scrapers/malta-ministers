const fs = require('fs');
let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = function () {
  return `SELECT DISTINCT ?item ?itemLabel
          ?position ?positionLabel ?start ?end ?cabinet ?cabinetLabel
          ?ordinal ?replaces ?replacesLabel ?replacedBy ?replacedByLabel
          ?nature ?natureLabel
          ?source ?sourceName ?statedName
         (STRAFTER(STR(?held), '/statement/') AS ?psid)
  WHERE {
    # All ministerial/cabinet positions in this jurisdiction
    { ?position wdt:P279* wd:Q83307 ; wdt:P1001 wd:${meta.jurisdiction.id} } UNION
    { ?position wdt:P361 wd:${meta.cabinet.parent} }

    # People who have held those positions
    ?item wdt:P31 wd:Q5 ; p:P39 ?held .
    ?held ps:P39 ?position
    FILTER NOT EXISTS { ?held wikibase:rank wikibase:DeprecatedRank }
    OPTIONAL { ?held pq:P580 ?start }
    OPTIONAL { ?held pq:P582 ?end }
    OPTIONAL { ?held pq:P5054 ?cabinet }
    OPTIONAL { ?held pq:P1545 ?ordinal }
    OPTIONAL { ?held pq:P1365 ?replaces }
    OPTIONAL { ?held pq:P1366 ?replacedBy }
    OPTIONAL { ?held pq:P5102 ?nature }

    OPTIONAL {
      ?held prov:wasDerivedFrom ?ref .
      ?ref pr:P854 ?source .
      OPTIONAL { ?ref pr:P1810 ?sourceName }
      OPTIONAL { ?ref pr:P1932 ?statedName }
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "en".  }
  }
  ORDER BY ?itemLabel ?positionLabel ?start ?held`
}
