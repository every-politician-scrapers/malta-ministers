const fs = require('fs');
let rawmeta = fs.readFileSync('meta.json');
let meta = JSON.parse(rawmeta);

module.exports = function () {
  return `SELECT DISTINCT ?item ?itemLabel ?itemDescription ?gender ?genderLabel
          ?dob ?dobPrecision ?dod ?dodPrecision
  WHERE {
    # All ministerial/cabinet positions in this jurisdiction
    { ?position wdt:P279* wd:Q83307 ; wdt:P1001 wd:${meta.jurisdiction.id} } UNION
    { ?position wdt:P361 wd:${meta.cabinet.parent} }

    # People who have held those positions
    ?item wdt:P31 wd:Q5 ; p:P39 ?held .
    ?held ps:P39 ?position
    FILTER NOT EXISTS { ?held wikibase:rank wikibase:DeprecatedRank }

    OPTIONAL { ?item wdt:P21 ?gender }

    OPTIONAL { # truthiest DOB, with precison
      ?item p:P569 [ a wikibase:BestRank ; psv:P569 [wikibase:timeValue ?dob ; wikibase:timePrecision ?dobPrecision] ]
    }

    OPTIONAL { # truthiest DOD, with precison
      ?item p:P570 [ a wikibase:BestRank ; psv:P570 [wikibase:timeValue ?dod ; wikibase:timePrecision ?dodPrecision] ]
    }

    SERVICE wikibase:label { bd:serviceParam wikibase:language "en".  }
  }
  ORDER BY ?itemLabel ?dob ?dod`
}
