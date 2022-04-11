#!/bin/env ruby
# frozen_string_literal: true

require 'every_politician_scraper/scraper_data'
require 'pry'

class String
  def ztidy
    gsub(/[\u200B-\u200D\uFEFF]/, '').tidy
  end
end

class Member < Scraped::HTML
  field :name do
    raw_name.gsub(/^Hon\.? /, '')
  end

  field :position do
    fields.map(&:text).map(&:ztidy)
          .select { |txt| txt.include? 'MINIST' }.first
          .gsub('MINISTRY', 'MINISTER')
          .gsub(/^OFFICE OF THE PRIME MINISTER/, 'Prime Minister')
          .gsub(/^OFFICE OF THE DEPUTY PRIME MINISTER/, 'Deputy Prime Minister')
          .split(/ AND (?=MINISTER)/)
  end

  field :url do
    noko.xpath('//link[@rel="canonical"]/@href').text
  end

  private

  def fields
    noko.css('.ms-rtestate-field strong,span')
  end

  def raw_name
    fields.map(&:text).map(&:ztidy).find { |txt| txt =~ / (MP|Hon)/ }.split(':').last.tidy
  end
end

dir = Pathname.new '../../mirror'
data = dir.children.reject { |file| file.to_s.include? 'default.aspx' }.sort.flat_map do |file|
  request = Scraped::Request.new(url: file, strategies: [LocalFileRequest])
  data = Member.new(response: request.response).to_h
  [data.delete(:position)].flatten.map { |posn| data.merge(position: posn) }
end.uniq

ORDER = %i[name position url].freeze
puts ORDER.to_csv
data.each { |row| puts row.values_at(*ORDER).to_csv }
