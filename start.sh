
#!/bin/bash

# ResearchHive - One-Command Start Script
# This script starts both the FastAPI backend and the React frontend
# in a single terminal session.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ResearchHive - Starting Up${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}[WARNING]${NC} backend/.env not found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}[WARNING]${NC} Please edit backend/.env and add your GEMINI_API_KEY"
    echo -e "${YELLOW}[WARNING]${NC} Get a free key at: https://aistudio.google.com/apikey"
    echo
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}[WARNING]${NC} Virtual environment not found. Running setup.sh first..."
    ./setup.sh
fi

# Kill any existing processes on ports 8000 and 5173
echo -e "${BLUE}[INFO]${NC} Clearing ports 8000 and 5173..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Start Backend
echo -e "${GREEN}[BACKEND]${NC} Starting FastAPI server on http://localhost:8000..."
cd backend
source venv/bin/activate
python main.py > /tmp/researchhive_backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${BLUE}[INFO]${NC} Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}[BACKEND]${NC} Backend is healthy and running!"
        break
    fi
    sleep 1
done

# Start Frontend
echo -e "${GREEN}[FRONTEND]${NC} Starting Vite dev server on http://localhost:5173..."
cd ResearchHive
npm run dev > /tmp/researchhive_frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
echo -e "${BLUE}[INFO]${NC} Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}[FRONTEND]${NC} Frontend is running!"
        break
    fi
    sleep 1
done

echo
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ResearchHive is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:5173"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "  ${BLUE}API Docs:${NC}  http://localhost:8000/docs"
echo -e "  ${BLUE}Demo:${NC}      http://localhost:5173/demo-report"
echo
echo -e "  Logs:"
echo -e "    Backend:  /tmp/researchhive_backend.log"
echo -e "    Frontend: /tmp/researchhive_frontend.log"
echo
echo -e "  Press Ctrl+C to stop both servers."
echo

# Cleanup function
cleanup() {
    echo
    echo -e "${YELLOW}Shutting down ResearchHive...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}ResearchHive stopped. Goodbye!${NC}"
    exit 0
}

# Trap Ctrl+C and other signals
trap cleanup SIGINT SIGTERM

# Keep script running and show logs
echo -e "${BLUE}Live logs (Ctrl+C to stop):${NC}"
echo -e "${BLUE}----------------------------------------${NC}"
tail -f /tmp/researchhive_backend.log /tmp/researchhive_frontend.log