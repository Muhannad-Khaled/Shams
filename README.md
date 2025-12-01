# Shams - Real-time Voice Agent

**Shams** (شمس - meaning "Sun" in Arabic) brings warmth and brightness to your conversations! Built with LiveKit Agents framework and Google's Gemini Live API, Shams is your cheerful AI voice companion that speaks in Egyptian Arabic dialect.

![Shams Voice Agent](assets/screenshot.png)

## Features

- Real-time voice conversation with Google Gemini
- Function calling support (weather, time, reminders)
- Voice Activity Detection for natural interruptions
- Beautiful React frontend with audio visualization
- WebSocket-based low-latency communication

## Architecture

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  React/Next.js  │◄──────────────────►│  LiveKit Cloud   │
│    Frontend     │                    │     Server       │
└─────────────────┘                    └────────┬─────────┘
                                                │
                                       ┌────────▼─────────┐
                                       │  Python Agent    │
                                       │  (LiveKit Agent) │
                                       └────────┬─────────┘
                                                │
                                       ┌────────▼─────────┐
                                       │  Google Gemini   │
                                       │    Live API      │
                                       └──────────────────┘
```

## Prerequisites

- Python 3.9+
- Node.js 18+
- pnpm (or npm/yarn)
- LiveKit Cloud account (free tier at https://cloud.livekit.io)
- Docker & Docker Compose (for containerized deployment)

## Docker Deployment

### Quick Start with Docker

```bash
# 1. Copy environment template and fill in your credentials
cp .env.example .env
# Edit .env with your LiveKit and Google API keys

# 2. Start in development mode (direct access on port 3000)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Access at http://localhost:3000
```

### Production Deployment

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with production values

# 2. (Optional) Add SSL certificates for HTTPS
# Place cert.pem and key.pem in nginx/ssl/
# Then uncomment the HTTPS server block in nginx/nginx.conf

# 3. Build and start
docker-compose up --build -d

# Access at http://localhost (or https:// if SSL configured)
```

### Docker Commands Reference

```bash
# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f agent
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build -d

# Restart specific service
docker-compose restart agent
```

### Docker Architecture

```
┌───────────────────────────────────────────────────────┐
│                  docker-compose                        │
│  ┌─────────┐    ┌────────────┐    ┌───────────────┐   │
│  │  Nginx  │───►│  Frontend  │    │    Agent      │   │
│  │ :80/443 │    │   :3000    │    │   (Python)    │   │
│  └─────────┘    └────────────┘    └───────────────┘   │
│       │              │                   │            │
│       └──────────────┴───────────────────┘            │
│                   shams-network                        │
└───────────────────────────────────────────────────────┘
                         │
                         ▼
              LiveKit Cloud + Google Gemini
```

## Quick Start (Manual)

### 1. Set up LiveKit Cloud

1. Go to https://cloud.livekit.io and create a free account
2. Create a new project
3. Note down your credentials:
   - `LIVEKIT_URL` (e.g., `wss://your-project.livekit.cloud`)
   - `LIVEKIT_API_KEY`
   - `LIVEKIT_API_SECRET`

### 2. Configure Environment Variables

**Agent (`agent/.env`):**
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
GOOGLE_API_KEY=your-google-api-key
```

**Frontend (`frontend/.env.local`):**
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### 3. Start the Python Agent

```bash
cd agent

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Run in development mode
python src/agent.py dev
```

### 4. Start the Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### 5. Open the Application

Navigate to http://localhost:3000 and click "Start Voice Call"

## Project Structure

```
shams/
├── agent/                    # Python backend (Shams agent)
│   ├── src/
│   │   └── agent.py         # Main agent code
│   ├── Dockerfile           # Agent container config
│   ├── .env                 # Environment variables
│   ├── pyproject.toml       # Python dependencies
│   └── requirements.txt     # Alternative pip requirements
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx     # Main voice UI
│   │       ├── layout.tsx   # App layout
│   │       └── api/
│   │           └── connection-details/
│   │               └── route.ts  # Token generation
│   ├── Dockerfile           # Frontend container config
│   ├── .env.local           # Environment variables
│   ├── package.json
│   └── next.config.js
├── nginx/                    # Nginx reverse proxy
│   ├── nginx.conf           # Nginx configuration
│   └── ssl/                 # SSL certificates (add your own)
├── docker-compose.yml        # Production orchestration
├── docker-compose.dev.yml    # Development overrides
├── .env.example             # Environment template
├── .dockerignore            # Docker build exclusions
├── .gitignore               # Git ignore rules
└── README.md
```

## Adding Custom Function Tools

The agent supports custom function tools. Add more by following this pattern in `agent/src/agent.py`:

```python
from livekit.agents import function_tool, RunContext

@function_tool
async def search_web(context: RunContext, query: str) -> str:
    """Search the web for information.

    Args:
        query: The search query
    """
    # Your implementation here
    return f"Search results for: {query}"

# Add to agent's tools list
agent = Agent(
    instructions="...",
    tools=[get_weather, get_time, set_reminder, search_web],
)
```

## Gemini Voice Options

Available voices for Google Gemini Live API:
- `Puck` - Friendly, conversational (default)
- `Charon` - Deep, authoritative
- `Kore` - Warm, professional
- `Fenrir` - Energetic
- `Aoede` - Melodic, calm

Change the voice in `agent/src/agent.py`:

```python
llm=google.realtime.RealtimeModel(
    model="gemini-2.0-flash-exp",
    voice="Charon",  # Change voice here
    temperature=0.8,
)
```

## Configuration Options

| Option | Description |
|--------|-------------|
| `model` | Gemini model: `gemini-2.0-flash-exp` or `gemini-2.5-flash-native-audio-preview-09-2025` |
| `voice` | Voice persona (see above) |
| `temperature` | Response creativity (0.0-1.0) |
| `instructions` | System prompt for the agent |

## Troubleshooting

### Agent doesn't connect
- Verify LiveKit credentials in both `.env` files match
- Ensure the agent is running before clicking "Start Voice Call"
- Check the agent console for error messages

### No audio
- Allow microphone access in your browser
- Check that your microphone is working
- Try a different browser (Chrome recommended)

### Connection errors
- Verify your LiveKit Cloud project is active
- Check your internet connection
- Ensure WebSocket connections are not blocked by firewall

## Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [Google Gemini Live API](https://ai.google.dev/gemini-api/docs/live)
- [LiveKit Components React](https://docs.livekit.io/reference/components/)

## License

MIT
