#!/bin/bash
# Start Anvil local blockchain node
# This script checks if Anvil is already running and starts it if not

set -e

ANVIL_PORT=${ANVIL_PORT:-8545}
ANVIL_HOST=${ANVIL_HOST:-0.0.0.0}

# Check if Anvil is already running
if command -v curl >/dev/null 2>&1; then
  if curl -s -X POST http://localhost:${ANVIL_PORT} \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}' >/dev/null 2>&1; then
    echo "Anvil is already running on http://localhost:${ANVIL_PORT}"
    exit 0
  fi
fi

# Check if Foundry/Anvil is installed
if ! command -v anvil >/dev/null 2>&1; then
  echo "Error: Anvil is not installed. Please install Foundry:"
  echo "  curl -L https://foundry.paradigm.xyz | bash"
  echo "  foundryup"
  exit 1
fi

echo "Starting Anvil local blockchain on http://${ANVIL_HOST}:${ANVIL_PORT}..."

# Start Anvil in the background
anvil --host ${ANVIL_HOST} --port ${ANVIL_PORT} &

ANVIL_PID=$!

# Wait for Anvil to be ready
echo "Waiting for Anvil to be ready..."
for i in {1..30}; do
  if command -v curl >/dev/null 2>&1; then
    if curl -s -X POST http://localhost:${ANVIL_PORT} \
      -H "Content-Type: application/json" \
      -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}' >/dev/null 2>&1; then
      echo "Anvil is ready! (PID: ${ANVIL_PID})"
      echo "RPC URL: http://localhost:${ANVIL_PORT}"
      exit 0
    fi
  fi
  sleep 1
done

echo "Error: Anvil failed to start within timeout period"
kill ${ANVIL_PID} 2>/dev/null || true
exit 1

