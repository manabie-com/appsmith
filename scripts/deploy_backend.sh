#!/bin/bash
# make sure you run: chmod +x deploy_backend.sh

CLEAN="false"

while [[ $# -gt 0 ]]
do
    key="$1"
    case $key in
        -c|-clean)
        CLEAN="true"
        shift
        ;;
        *)
        echo "Invalid argument: $key"
        exit 1
        ;;
    esac
done

## detect the server folder
SCRIPTS_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPTS_DIR/.." || exit

APP_DIR="$(pwd)/app/server"

cd "$APP_DIR" || exit


if [[ -f envs/docker.env ]]; then
    echo "Using existing env file"
else
    cp envs/docker.env.example envs/docker.env
fi

echo "Backend env:"
# cat envs/docker.env && echo

if [[ "$CLEAN" == "true" ]]; then
    echo "Cleaning existing container..." && echo
    CONTAINER_ID=$(docker ps -aqf "name=server-appsmith-internal-server-1")
    if [[ -n "$CONTAINER_ID" ]]; then
        docker stop "$CONTAINER_ID"
        docker rm "$CONTAINER_ID"
        IMAGE_ID=$(docker images --filter "reference=server-appsmith-internal-server" --format "{{.ID}}")
        if [[ -n "$IMAGE_ID" ]]; then
            docker rmi "$IMAGE_ID"
        else
            echo "No appsmith/app/server image to remove."
        fi
    else
        echo "No server-appsmith-internal-server-1 container to remove."
    fi
    echo "Start building java resources..." && echo "sudo ./build.sh -DskipTests"
    sudo ./build.sh -DskipTests
else
    if [[ -f dist/server-1.0-SNAPSHOT.jar ]]; then
        echo "Skipping build, jar file already exists" && echo
    else
        echo "Start building java resources..." && echo "sudo ./build.sh -DskipTests"
        sudo ./build.sh -DskipTests
    fi
fi

# compose image
echo "docker compose up -d"

docker compose up -d
