#!/bin/bash
# make sure you run: chmod +x deploy_client.sh

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

## detect the client folder
SCRIPTS_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPTS_DIR/.." || exit

CLIENT_DIR="$(pwd)/app/client"

if [[ "$CLEAN" == "true" ]]; then
    echo "installing certificates..."
    mkcert -install
    echo "Killing existing nginx server..."
    sudo fuser -k 80/tcp 443/tcp
    echo "Removing existing nginx folder..."
    sudo rm -rf "$CLIENT_DIR/nginx"
fi

echo "Starting HTTPS server..."
cd "$CLIENT_DIR" || exit
sudo ./start-https.sh
