---

# LLM-Powered Prompt Router for Intent Classification

---

# Overview

This project implements an **LLM-powered prompt router** that automatically detects a user's intent and routes the request to a specialized AI persona.

Instead of using one general AI prompt, the system performs **intent classification first**, then routes the message to an **expert prompt optimized for that task**.

This approach improves:

- response quality  
- cost efficiency  
- control over AI behavior  
- modular system design  

---

# Why This Architecture?

Traditional AI chat systems use a **single prompt for everything**.  

That causes problems:

- poor task specialization  
- inconsistent responses  
- higher cost per request  

This project solves that by introducing a **two-stage routing pipeline**.

---

# System Architecture

```
User Message
      │
      ▼
Intent Classifier (LLM)
      │
      ▼
Intent Label
(code / data / writing / career / unclear)
      │
      ▼
Persona Router
      │
      ▼
Specialized System Prompt
      │
      ▼
LLM Response Generator
      │
      ▼
Final Response
      │
      ▼
route_log.jsonl (observability log)
```

---

# Why Groq?

The project originally used Claude/Gemini models, but Groq was selected because it provides:

- **extremely fast inference**  
- **free developer access**  
- **modern Llama-3.1 models**  
- **OpenAI-compatible API design**  

Models used:

| Purpose               | Model                     |
| --------------------- | ------------------------- |
| Intent Classification | `llama-3.1-8b-instant`    |
| Response Generation   | `llama-3.1-70b-versatile` |

This combination gives **fast routing + high-quality responses**.

---

# Features

### Intelligent Prompt Routing
Automatically detects user intent and routes requests.

### Expert Personas
Each intent has a specialized system prompt.

### Confidence Threshold
Low-confidence classifications automatically route to **clarification mode**.

### Manual Intent Override
Users can explicitly force routing.

Example:
```
@code fix this python bug
```

### Observability Logging
Every request and response is logged.
```
route_log.jsonl
```

### CLI Interface
Interactive prompt router via terminal.

### Automated Test Suite
15 required test cases verify routing behavior.

### Docker Support
Containerized execution for reproducibility.

---

# Expert Personas

| Intent  | Persona           | Behavior                                   |
| ------- | ----------------- | ------------------------------------------ |
| code    |  Code Expert | Produces production-ready code             |
| data    |  Data Analyst   | Explains numbers, statistics, and datasets |
| writing |  Writing Coach  | Gives feedback without rewriting           |
| career  |  Career Advisor | Provides structured career guidance        |
| unclear |  Clarifier      | Asks one focused clarification question    |

---

# Project Structure

```
llm-prompt-router
│
├── index.js
├── router.js
├── logger.js
├── prompts.json
├── test.js
│
├── package.json
├── README.md
│
├── Dockerfile
├── docker-compose.yml
│
├── .env.example
├── .gitignore
│
└── route_log.jsonl
```

---

# Installation

## Prerequisites
- Node.js v18+  
- Groq API key  

---

# Setup

Clone the project:
```
git clone <repository-url>
cd llm-prompt-router
```

Install dependencies:
```
npm install
```

---

# Environment Setup

Copy the example environment file:
```
cp .env.example .env
```

Edit `.env` and add your Groq key:
```
GROQ_API_KEY=your_groq_api_key_here
```

Get a free key:  
[https://console.groq.com/keys](https://console.groq.com/keys)

---

# Running the Router

Start interactive CLI:
```
npm start
```

Example:
```
You > how do i sort a list in python
```

Output:
```
Intent: CODE
Routing to: Code Expert
Response: ...
```

---

# Single-Query Mode

Run a single query:
```
node index.js "how do i reverse a string in javascript"
```

---

# Running the Test Suite

Run the full evaluation tests:
```
npm test
```

Output:
```
15/15 tests passed
```

---

# Logs

Every request is logged for observability:
```
route_log.jsonl
```

Example log entry:
```
{
  "timestamp": "...",
  "intent": "code",
  "confidence": 0.92,
  "persona": "Code Expert",
  "message": "sort list python",
  "response": "..."
}
```

---

# Docker Execution

Build container:
```
docker compose build
```

Run router:
```
docker compose run llm-router
```

Start container service:
```
docker compose up
```

---

# Example Interaction

```
You > how do i sort a list in python
```

Router detects:
```
Intent: CODE
Confidence: 0.95
```

Routes to:
```
 Code Expert
```

Produces a Python solution.

---

# Stretch Goals Implemented

✔ Confidence threshold fallback  
✔ Manual intent override  
✔ CLI intent visibility  
✔ Observability logging  
✔ Docker containerization  

---

# Design Decisions

### Two-Stage LLM Pipeline
Improves specialization and modularity.

### System Prompt Personas
Ensures consistent role-based responses.

### JSON Intent Output
Allows deterministic routing logic.

### Logging Layer
Enables debugging and analytics.

---

# Future Improvements

- add caching for repeated prompts  
- replace LLM classifier with lightweight model  
- add REST API interface  
- support streaming responses  

---