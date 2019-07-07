#!/bin/bash
user="admin"
password="secret"
database="be"
host=`[[ "$DOCKER_HOST" =~ tcp://([0-9]+.[0-9]+.[0-9]+.[0-9]+) ]] && echo ${BASH_REMATCH[1]}`
docker run --rm -it -e PGPASSWORD=$password postgres:9.6-alpine psql -h $host -U $user $database
