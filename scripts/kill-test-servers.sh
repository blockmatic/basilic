#!/bin/bash
# Kill any processes running on test server ports (3000 and 3001)
# This is useful for cleaning up after failed e2e tests

echo "Killing processes on test ports..."

kill_port() {
  local port=$1
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -tiTCP:"${port}" -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$pids" ]; then
      echo "$pids" | xargs kill -9 2>/dev/null || true
      echo "Killed process(es) on port $port (via lsof)"
      return
    fi
  fi

  if command -v fuser >/dev/null 2>&1; then
    if fuser -k "${port}/tcp" >/dev/null 2>&1; then
      echo "Killed processes on port $port (via fuser)"
      return
    fi
  fi

  echo "No process found on port $port"
}

kill_port 3000
kill_port 3001

echo "Done."
