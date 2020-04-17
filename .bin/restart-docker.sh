#!/usr/bin/env bash

script_path=$(realpath "$0")
script_dir=$(dirname "$script_path")
project_root=$(dirname "$script_dir")

# shellcheck disable=SC1090
. "$script_dir"/set-env.sh

docker-compose -f "$project_root"/server/.docker/docker-compose.yml -f "$project_root"/.docker/docker-compose.staging.yml down
docker-compose -f "$project_root"/server/.docker/docker-compose.yml -f "$project_root"/.docker/docker-compose.staging.yml up -d --build
