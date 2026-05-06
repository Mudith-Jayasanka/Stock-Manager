#!/bin/bash

# Ports to check
FRONTEND_PORT=4200
BACKEND_PORT=3000

kill_port() {
  local port=$1
  echo "Checking port $port..."
  
  # For Windows (Git Bash / Cygwin)
  if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Find PID using netstat
    local pid=$(netstat -ano | grep "LISTENING" | grep ":$port " | awk '{print $5}' | head -n 1)
    if [ -n "$pid" ]; then
      echo "Found process $pid on port $port. Killing..."
      taskkill //F //PID $pid
    else
      echo "No process found on port $port."
    fi
  else
    # For Linux / macOS
    local pid=$(lsof -t -i:$port)
    if [ -n "$pid" ]; then
      echo "Found process(es) $pid on port $port. Killing..."
      kill -9 $pid
    else
      echo "No process found on port $port."
    fi
  fi
}

kill_port $FRONTEND_PORT
kill_port $BACKEND_PORT
