#!/bin/bash

# ResearchHive - One-Command Setup Script
# This script sets up the entire ResearchHive project (frontend + backend)

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# Check if running from correct directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

print_step "ResearchHive Setup Starting"
print_info "Project root: $PROJECT_ROOT"

# Check prerequisites
print_step "Checking Prerequisites"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node --version)
print_info "Node.js version: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi
NPM_VERSION=$(npm --version)
print_info "npm version: $NPM_VERSION"

# Check Python
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3.9+ from https://python.org/"
    exit 1
fi
PYTHON_VERSION=$(python3 --version)
print_info "Python version: $PYTHON_VERSION"

# Check pip
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip."
    exit 1
fi
PIP_VERSION=$(pip3 --version)
print_info "pip version: $PIP_VERSION"

# Setup Backend
print_step "Setting Up Backend"

BACKEND_DIR="$PROJECT_ROOT/backend"
cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_success "Virtual environment created"
else
    print_info "Virtual environment already exists"
fi

# Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
print_info "Upgrading pip..."
pip install --upgrade pip > /dev/null 2>&1

# Install backend dependencies
print_info "Installing backend dependencies..."
pip install -r requirements.txt
print_success "Backend dependencies installed"

# Setup environment file
if [ ! -f ".env" ]; then
    print_info "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please edit backend/.env and add your GEMINI_API_KEY"
    print_warning "Get a free API key from: https://aistudio.google.com/apikey"
else
    print_info ".env file already exists"
fi

# Setup Frontend
print_step "Setting Up Frontend"

FRONTEND_DIR="$PROJECT_ROOT/ResearchHive"
cd "$FRONTEND_DIR"

# Install frontend dependencies
print_info "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Create data directories
print_step "Creating Data Directories"
mkdir -p "$BACKEND_DIR/data/uploads"
mkdir -p "$BACKEND_DIR/data/faiss_index"
mkdir -p "$BACKEND_DIR/data/analyses"
print_success "Data directories created"

# Final instructions
print_step "Setup Complete!"

echo -e "${GREEN}ResearchHive is ready to run!${NC}\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. ${BLUE}Edit backend/.env${NC} and add your Gemini API key:"
echo -e "   GEMINI_API_KEY=your_key_here"
echo -e "   Get a free key at: https://aistudio.google.com/apikey\n"

echo -e "2. ${BLUE}Start the backend${NC} (in a new terminal):"
echo -e "   cd $BACKEND_DIR"
echo -e "   source venv/bin/activate"
echo -e "   python main.py\n"

echo -e "3. ${BLUE}Start the frontend${NC} (in another new terminal):"
echo -e "   cd $FRONTEND_DIR"
echo -e "   npm run dev\n"

echo -e "${YELLOW}Access Points:${NC}"
echo -e "  • Frontend: http://localhost:5173"
echo -e "  • Backend API: http://localhost:8000"
echo -e "  • API Docs: http://localhost:8000/docs"
echo -e "  • Demo Report: http://localhost:5173/demo-report\n"

echo -e "${YELLOW}Features to Try:${NC}"
echo -e "  • Upload 3-5 PDF papers and click 'Start Analysis'"
echo -e "  • Visit /demo-report for a pre-built demo"
echo -e "  • Download PDF or Markdown reports"
echo -e "  • Watch real-time agent progress updates"

print_step "Happy Researching! 🚀"