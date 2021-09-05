const fs = require('fs');
let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = function () {
  return `SELECT DISTINCT ?item ?itemLabel
          ?position ?positionLabel ?start ?end ?cabinet ?cabinetLabel
          ?source ?sourceName ?statedName
          ?gender ?genderLabel ?dob ?dobPrecision
         (STRAFTER(STR(?held), '/statement/') AS ?psid)
  WHERE {
    # Positions that have been in the cabinet
    ?position wdt:P361 wd:${meta.cabinet.parent} .

    # People who have held positions
    ?item wdt:P31 wd:Q5 ; p:P39 ?held .
    ?held ps:P39 ?position
    FILTER NOT EXISTS { ?held wikibase:rank wikibase:DeprecatedRank }
    OPTIONAL { ?held pq:P580 ?start }
    OPTIONAL { ?held pq:P582 ?end }
    OPTIONAL { ?held pq:P5054 ?cabinet }

    OPTIONAL {
      ?held prov:wasDerivedFrom ?ref .
      ?ref pr:P854 ?source .
      OPTIONAL { ?ref pr:P1810 ?sourceName }
      OPTIONAL { ?ref pr:P1932 ?statedName }
    }

    OPTIONAL { ?item wdt:P21 ?gender }
    OPTIONAL { # truthiest DOB, with precison
      ?item p:P569 ?ts .
      ?ts a wikibase:BestRank .
      ?ts psv:P569 [wikibase:timeValue ?dob ; wikibase:timePrecision ?dobPrecision] .
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "en".  }
  }
  ORDER BY ?itemLabel ?positionLabel ?start ?held`
}
