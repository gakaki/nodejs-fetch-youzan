#!/bin/bash node 


fs 			= require 'fs'
filename 	= "./city.json"
json_str	=  fs.readFileSync filename, 'utf8'
data 		= JSON.parse json_str
data		= data.RECORDS
# console.log data.length

filter_el_by_level  = (num) => (i for i in data when i.level_type is num)
filter_el_by_parent = (parent_id,data_arr) => (i for i in data_arr when i.parent_id is parent_id)

provinces    = filter_el_by_level('1')
cities       = filter_el_by_level('2')
districts    = filter_el_by_level('3')

for p in provinces
	p.citylist = filter_el_by_parent( p.id , cities )
	for c in p.citylist
		c.countylist = filter_el_by_parent( c.id , districts )

provinces	= { "provincelist":provinces }		
console.dir(provinces)

outputFilename = './city_convert.json';
fs.writeFileSync outputFilename, JSON.stringify(provinces, null, 4)

#fs.appendFile('/tmp/data.txt', data.count.value, (error) -> throw error if error)
