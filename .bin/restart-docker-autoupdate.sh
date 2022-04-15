#!/usr/bin/env bash

script_path=$(realpath "$0")
script_dir=$(dirname "$script_path")
project_root=$(dirname "$script_dir")

# shellcheck disable=SC1090
. "$script_dir"/set-env.sh

# passing --clean should remove all docker volumes meaning purging all the data and cleaning orphan containers
down_opts="";
if [ "$1" == "--clean" ]
  then
    down_opts="$down_opts --volumes --remove-orphans"
fi

docker-compose -f "$project_root"/server/.docker/docker-compose.yml -f "$project_root"/.docker/docker-compose.watchtower.yml down $down_opts
docker-compose -f "$project_root"/server/.docker/docker-compose.yml -f "$project_root"/.docker/docker-compose.watchtower.yml up -d --build
