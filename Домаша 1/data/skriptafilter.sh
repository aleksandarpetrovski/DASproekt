#!/bin/bash

if [ -f baza.csv ]
then
	rm baza.csv
fi

osmfilter map.osm --keep="amenity=pharmacy or healthcare=pharmacy" | \
osmconvert - --all-to-nodes --csv="@id @lon @lat name" --csv-headline --csv-separator="," > baza.csv

