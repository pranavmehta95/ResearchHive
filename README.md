# ResearchHive - Multi-Agent Literature Review Platform

A premium, modern academic research dashboard for analyzing uploaded research papers using AI agents.

## Live Demo
Visit `/demo-report` to see the platform with sample fake news detection papers.

## Features

### 🎯 Core Features
- **Multi-Agent Analysis**: Paper Analyst, Methodology Analyst, Critique Agent, Citation Agent, Research Manager
- **Drag & Drop Upload**: 3-5 PDF papers for instant analysis
- **Real-time Progress**: Live status updates and agent progress tracking
- **Interactive Reports**: Comprehensive literature review with charts and insights
- **Premium UI**: Glassmorphism design with dark navy theme

### 📊 Data Visualization
- **Radar Chart**: Compare papers across novelty, methodology, datasets, evaluation, impact
- **Research Gap Heatmap**: Priority visualization of research gaps
- **Consensus Score**: Agreement percentage across papers
- **Timeline Visualization**: Multi-agent workflow progress

### 💡 Report Generation
- **Executive Summary**: Key findings and conclusions
- **Individual Paper Analysis**: Detailed breakdowns with evidence references
- **Methodology Comparison**: Side-by-side analysis
- **Research Gaps & Future Directions**: Actionable insights
- **IEEE Citations**: Properly formatted references
- **Download Options**: PDF and Markdown reports

## System Architecture

### Frontend (React + Vite)
- **Routing**: React Router for multi-page experience
- **State Management**: React hooks with Framer Motion animations
- **API Client**: Axios-based communication with backend
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with custom components

### Backend (FastAPI)
- **RAG Pipeline**: PDF extraction → Embeddings → Vector search
- **Multi-Agent System**: Google Gemini 1.5 Flash integration
- **FAISS**: Local vector database for paper similarity search
- **Real-time Updates**: WebSocket-like polling for status
- **PDF Processing**: PyPDF for text extraction with fallback to PyMuPDF

### Integration
- **Real-time Updates**: Frontend polling backend status every 3 seconds
- **Report Sharing**: Analysis results accessible via shareable URLs
- **Evidence Citations**: All claims linked to source text chunks

## Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.9+ (for backend)

### Installation

#### Option 1: One-Command Setup (Recommended)
```bash
./setup.sh
```

#### Option 2: Step by Step

**Backend Setup**
```bash
# Clone repository
cd ResearchHive

# Create virtual environment and install backend dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Set up environment variables (copy from .env.example)
cp .env.example .env

# Start backend (terminal 1)
python main.py
```

**Frontend Setup**
```bash
# In another terminal
cd ResearchHive
npm install

# Start frontend (terminal 2)
npm run dev
```

## Project Structure

```
ResearchHive/
├── backend/
│   ├── agents/              # Agent implementations
│   │   ├── base_agent.py
│   │   ├── paper_analysis_agent.py
│   │   ├── methodology_agent.py
│   │   ├── critique_agent.py
│   │   ├── citation_agent.py
│   │   └── research_manager_agent.py
│   ├── api/                # FastAPI routes
│   │   └── routes.py
│   ├── services/           # Utility services
│   │   ├── pdf_processor.py
│   │   └── embedding_service.py
│   ├── utils/              # Configuration
│   │   └── config.py
│   ├── models/             # Data schemas
│   │   └── schemas.py
│   ├── .env.example       # Environment template
│   └── main.py            # FastAPI application
│
├── src/
│   ├── components/        # React components
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   ├── UploadArea.jsx
│   │   ├── AgentCard.jsx
│   │   ├── ProgressTimeline.jsx
│   │   ├── ResultTabs.jsx
│   │   └── Report.jsx
│   ├── pages/             # Page components
│   │   ├── Dashboard.jsx
│   │   └── Report.jsx
│   ├── utils/             # Utility functions
│   │   ├── api.js
│   │   └── cn.js
│   ├── data/              # Mock data
│   │   └── mockData.js
│   ├── assets/            # Static assets
│   └── index.css         # Tailwind styles
│
├── setup.sh              # One-command setup script
└── README.md             # This documentation
```

## Usage

### Basic Workflow

1. **Upload Papers**: Drag and drop 3-5 PDF research papers
2. **Start Analysis**: Click "Start Analysis" to initiate multi-agent processing
3. **Monitor Progress**: Watch real-time updates as agents complete tasks
4. **Review Results**: Access comprehensive report with insights and citations
5. **Download Reports**: Save as PDF or Markdown for sharing

### Demo Mode
Access via `/demo-report` URL to see all features with sample fake news detection papers without uploading anything.

### Report Features
- **Executive Summary**: High-level findings and conclusions
- **Individual Analysis**: Detailed breakdown per paper
- **Methodology Comparison**: Side-by-side analysis across papers
- **Research Gaps**: Identified limitations and future directions
- **Interactive Citations**: IEEE-formatted references with source links

## Agent Explanations

### Paper Analysis Agent
Analyzes individual papers to extract:
- Research objectives and questions
- Methodology descriptions
- Dataset information
- Key findings and results
- Conclusions and limitations

### Methodology Analyst
Compares papers across:
- Research approaches and algorithms
- Datasets and evaluation metrics
- Experimental designs
- Strengths and limitations

### Critique Agent
Evaluates papers for:
- Methodological limitations
- Assumptions and biases
- Missing evaluations
- Research gaps
- Future research opportunities

### Citation Agent
Extracts and formats:
- Complete citation metadata
- IEEE-style citations
- Author information
- Publication details

### Research Manager
Coordinates all agents to:
- Synthesize findings
- Create thematic clusters
- Identify consensus
- Generate final literature review

## RAG Implementation

1. **PDF Extraction**: Convert PDFs to text with PyPDF/PyMuPDF
2. **Chunking**: Split text into meaningful paragraphs
3. **Embedding**: Generate vector embeddings using Sentence Transformers (all-MiniLM-L6-v2)
4. **Storage**: Store in FAISS vector database
5. **Retrieval**: Find relevant context for each agent query
6. **Evidence**: All agent responses link to source text chunks

## Gemini API Integration

- **Model**: gemini-1.5-flash (free tier)
- **Features**: Text generation with structured outputs
- **Fallback**: Graceful degradation when API unavailable
- **Configuration**: Environment variable `GEMINI_API_KEY`

## Configuration

### Environment Variables
Create `.env` file in backend directory:
```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-flash
HOST=0.0.0.0
PORT=8000
RELOAD=true
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
DATA_DIR=./data
```

### Backend Configuration
- **Data Directory**: `backend/data/` (contains uploads, faiss_index, analyses)
- **Port**: 8000 (configurable)
- **CORS**: Allows frontend connections
- **File Uploads**: Limited to 3-5 PDF files per analysis

## Error Handling

### Upload Validation
- **File Type**: Only PDF files accepted
- **File Count**: 3-5 papers required
- **File Size**: Individual limits (backend configurable)
- **Empty Files**: Detection and meaningful error messages

### API Failures
- **Gemini Key**: Clear message to configure API key
- **Network Issues**: Retry mechanisms with user feedback
- **Database Errors**: Graceful degradation with mock data
- **File Processing**: Multiple extraction methods with fallbacks

## Installation via setup.sh

The `setup.sh` script automates the entire setup process:

1. Creates virtual environment (backend)
2. Installs all Python dependencies
3. Installs Node.js dependencies (frontend)
4. Sets up environment configuration
5. Provides instructions for running the application

Simply run `./setup.sh` and follow the interactive prompts.

## Troubleshooting

### Common Issues

**"Cannot read file" errors**
- Ensure PDF files are not corrupted
- Try converting PDFs to plain text if needed
- Check file permissions

**"Gemini API key not configured"**
- Set `GEMINI_API_KEY` in `.env` file
- Get free API key from [Google AI Studio](https://aistudio.google.com/apikey)

**"Port already in use"**
- Change port in `main.py` or stop other services
- Use different ports for frontend and backend if needed

### Development

**Frontend Development**
```bash
cd ResearchHive
npm run dev
```

**Backend Development**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Build for Production**
```bash
cd backend
pip install -r requirements.txt
cd ../ResearchHive
npm run build
```

## Future Enhancements

1. **Advanced RAG**: Semantic search with query understanding
2. **MongoDB Integration**: Persistent storage for analysis results
3. **Docker Support**: Containerized deployment
4. **WebSocket Support**: Real-time updates without polling
5. **Advanced Analytics**: Citation network analysis, topic modeling
6. **Multi-language Support**: Non-English paper processing
7. **Collaboration Features**: Team-based analysis projects
8. **API Documentation**: Swagger/OpenAPI documentation

## Technical Notes

### Why This Stack?
- **FastAPI**: Modern, fast Python web framework
- **React + Vite**: Blazing-fast frontend with excellent developer experience
- **Tailwind CSS**: Utility-first styling for rapid UI development
- **FAISS**: Lightning-fast vector search for RAG
- **Google Gemini**: Powerful LLM with free tier available

### Performance Considerations
- **Local Embedding**: Avoids API costs and latency
- **FAISS**: Sub-second similarity search
- **Caching**: Multiple levels of caching for repeated queries
- **Streaming**: Efficient data transfer for large reports

### Security
- **Environment Variables**: API keys and secrets in `.env`
- **CORS Configuration**: Restricted to trusted origins
- **File Validation**: Input sanitization and type checking
- **Rate Limiting**: Configuration for production deployment

## License

This project is part of a college demonstration and is licensed for educational purposes.

## Acknowledgements

- **Google**: Gemini AI model for agent intelligence
- **Huggingface**: Sentence Transformers for local embeddings
- **Faiss**: Fast vector similarity search
- **Open Source Community**: Libraries and tools enabling this project