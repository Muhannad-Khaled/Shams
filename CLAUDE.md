# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Shams** (شمس - "Sun" in Arabic) - A warm, bright, and cheerful AI voice companion. Built with LiveKit Agents framework (Python) and Google Gemini Live API, plus a React/Next.js frontend. Shams brings warmth and positivity to voice conversations in Egyptian Arabic dialect.

## Architecture

```
Frontend (Next.js) <--WebSocket--> LiveKit Cloud <--> Python Agent <--> Google Gemini Live API
```

- **Python Agent** (`agent/`): Connects to LiveKit rooms, processes audio via Silero VAD, sends to Gemini for real-time voice responses
- **Next.js Frontend** (`frontend/`): Generates LiveKit tokens via API route, renders voice UI with LiveKit Components

## Commands

### Python Agent (from `agent/` directory)
```bash
# Install dependencies
pip install -e .

# Development mode (auto-reload)
python src/agent.py dev

# Production mode
python src/agent.py start

# Console mode (terminal testing)
python src/agent.py console
```

### Frontend (from `frontend/` directory)
```bash
pnpm install       # Install dependencies
pnpm dev           # Development server (localhost:3000)
pnpm build         # Production build
pnpm lint          # Run linter
```

## Key Files

| File | Purpose |
|------|---------|
| `agent/src/agent.py` | Agent entrypoint, defines function tools, configures Gemini model |
| `frontend/src/app/page.tsx` | Main UI with LiveKitRoom, VoiceAssistant hooks, styled components |
| `frontend/src/app/api/connection-details/route.ts` | Generates LiveKit access tokens |

## Adding Function Tools

Use the `@function_tool` decorator in `agent/src/agent.py`:

```python
@function_tool
async def my_tool(context: RunContext, param: str) -> str:
    """Docstring is used by AI to decide when to call this."""
    return "result"

# Add to Agent's tools list
agent = Agent(instructions="...", tools=[my_tool])
```

## Environment Variables

Both `agent/.env` and `frontend/.env.local` need:
- `LIVEKIT_URL` - WebSocket URL (e.g., `wss://project.livekit.cloud`)
- `LIVEKIT_API_KEY` - From LiveKit Cloud
- `LIVEKIT_API_SECRET` - From LiveKit Cloud

Agent also needs:
- `GOOGLE_API_KEY` - For Gemini Live API

## Gemini Configuration

In `agent/src/agent.py`, modify `RealtimeModel`:
- `model`: `gemini-2.0-flash-exp` or `gemini-2.5-flash-native-audio-preview-09-2025`
- `voice`: `Puck`, `Charon`, `Kore`, `Fenrir`, or `Aoede`
- `temperature`: 0.0-1.0
