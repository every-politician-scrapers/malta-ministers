#!/bin/bash

cd $(dirname $0)

if [[ $(jq -r .source.url meta.json) == http* ]]
then
  rm -rf mirror
  mkdir mirror
  pushd mirror

  CURLOPTS='-L -c /tmp/cookies -A eps/1.2'
  curl $CURLOPTS -o default.aspx $(jq -r .source.url ../meta.json)
  for url in $(nokogiri -e "puts @doc.css('.ministry-block a/@href').map(&:text).select { |txt| txt.include? '/Pages/Ministries' }" default.aspx); do
    url="https://www.gov.mt$url"
    echo $url
    curl $CURLOPTS -O $url
  done
fi

popd
cd ~-
