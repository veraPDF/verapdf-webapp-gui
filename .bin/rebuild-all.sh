#!/usr/bin/env bash

script_path=$(realpath "$0")
script_dir=$(dirname "$script_path")
project_root=$(dirname "$script_dir")

echo "Building webapp server"
"$project_root/server/.bin/build-all.sh"

echo "Building webapp gui"
"$script_dir/build-gui.sh"

echo "Re-starting application stack"
"$script_dir/restart-docker.sh"

echo "Done!"
