# 🧠 Mind-OS Lite

> An AI-powered personal knowledge system. Store your thoughts, chat with your notes, and let your second brain work for you.


---

## 📖 What Is This?

Most people lose their best ideas — buried in random notes, forgotten chats, or never written down at all. **Mind-OS Lite** fixes that.

It's a personal knowledge system where you dump your thoughts, and AI does the heavy lifting: searching them semantically, answering questions about them, and surfacing patterns you'd never catch manually.

No keyword matching. No manual tagging. You just write — and ask.

---

## ✨ Features

| Feature | What It Does |
|---|---|
| **📝 Note Capture** | Add thoughts, ideas, and notes instantly |
| **🔍 Smart Search** | Semantic search powered by vector embeddings — finds meaning, not just keywords |
| **💬 Chat with Your Notes** | Ask questions in natural language. GPT answers using *your* stored knowledge |
| **📊 Weekly Summary** | Auto-generated weekly digest of what you've been thinking about |
| **🗄️ Persistent Storage** | Everything saved to a local SQLite database — no cloud dependency required |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│         React + Tailwind CSS + TypeScript        │
│                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│   │  Notes   │  │  Chat    │  │   Summary    │  │
│   │  UI      │  │  UI      │  │   UI         │  │
│   └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        │             │               │           │
└────────┼─────────────┼───────────────┼───────────┘
         │             │               │
         ▼             ▼               ▼
┌─────────────────────────────────────────────────┐
│                  Backend                         │
│              Python + FastAPI                    │
│                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│   │  Notes   │  │  Chat    │  │   Summary    │  │
│   │  API     │  │  API     │  │   API        │  │
│   └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│        │             │               │           │
└────────┼─────────────┼───────────────┼───────────┘
         │             │               │
         ▼             ▼               ▼
┌─────────────────────────────────────────────────┐
│                   AI Layer                       │
│                                                  │
│   ┌─────────────────┐   ┌─────────────────────┐ │
│   │ OpenAI Embeddings│   │  GPT-4o-mini (Chat) │ │
│   │ (text-embedding- │   │  (summarization +   │ │
│   │  ada-002)        │   │   Q&A)              │ │
│   └────────┬────────┘   └──────────┬──────────┘ │
│            │                       │             │
└────────────┼───────────────────────┼─────────────┘
             │                       │
             ▼                       ▼
┌─────────────────────────────────────────────────┐
│                  Database                        │
│              SQLite (local file)                 │
│                                                  │
│   ┌─────────────┐   ┌────────────────────────┐  │
│   │   Notes     │   │   Embeddings           │  │
│   │   Table     │   │   (vector store)       │  │
│   └─────────────┘   └────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### How the AI Pipeline Works

1. **You write a note** → saved to SQLite
2. **OpenAI generates an embedding** (a 1536-dim vector) for that note → stored alongside it
3. **You ask a question** → your question is also embedded
4. **Cosine similarity** finds the most relevant notes from your database
5. **GPT receives those notes as context** → generates an answer grounded in *your* knowledge

---

## 🛠️ Tech Stack

### Frontend
| Tech | Why |
|---|---|
| **React** | Component-based UI — clean and fast |
| **TypeScript** | Type safety, fewer bugs, better IDE support |
| **Tailwind CSS** | Utility-first styling — ships faster, looks polished |

### Backend
| Tech | Why |
|---|---|
| **Python** | Best ecosystem for AI/ML integrations |
| **FastAPI** | Async, fast, auto-generates docs at `/docs` |

### AI
| Tech | Why |
|---|---|
| **OpenAI Embeddings** (`text-embedding-ada-002`) | Converts text to vectors for semantic search |
| **GPT-4o-mini** | Powers the chat and summarization — fast + cost-effective |

### Database
| Tech | Why |
|---|---|
| **SQLite** | Zero config, local file, no server needed |

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [pip](https://pypa.io/en/stable/pip/)
- An [OpenAI API key](https://platform.openai.com/api-keys)

### 1. Clone the Repo

```bash
git clone https://github.com/tayalharsh58-droid/Mind-OS-Lite.git
cd Mind-OS-Lite
```

### 2. Set Up the Backend

```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate       # macOS/Linux
# venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt

# Create a .env file
echo "OPENAI_API_KEY=your_key_here" > .env

# Start the server
uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`. Visit `http://localhost:8000/docs` for the auto-generated API docs.

### 3. Set Up the Frontend

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 📁 Project Structure

```
Mind-OS-Lite/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NoteEditor.tsx       # Add / edit notes
│   │   │   ├── ChatWindow.tsx       # Chat with your notes
│   │   │   ├── SearchBar.tsx        # Smart search input
│   │   │   └── WeeklySummary.tsx    # Weekly digest view
│   │   ├── api/                     # Axios API calls to backend
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── backend/
│   ├── main.py                      # FastAPI app & route definitions
│   ├── database.py                  # SQLite connection & models
│   ├── embeddings.py                # OpenAI embedding logic
│   ├── chat.py                      # GPT chat + context retrieval
│   ├── summary.py                   # Weekly summary generation
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # API keys (gitignored)
│
├── README.md
└── .gitignore
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/notes` | Create a new note (auto-embeds it) |
| `GET` | `/notes` | List all notes |
| `DELETE` | `/notes/{id}` | Delete a note |
| `POST` | `/search` | Semantic search over your notes |
| `POST` | `/chat` | Ask a question — get an answer from your notes |
| `GET` | `/summary/weekly` | Get an AI-generated weekly summary |

---

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Your OpenAI API key (required) |

> ⚠️ Never commit your `.env` file. It's in `.gitignore` by default.

---

## 🤝 Contributing

1. **Fork** the repo
2. **Branch**: `git checkout -b feature/your-feature`
3. **Commit**: `git commit -m "Add your feature"`
4. **Push**: `git push origin feature/your-feature`
5. **PR**: Open a Pull Request

---

## 📋 Resume Line

> **Mind-OS Lite – AI Second Brain**
> Built an AI-powered personal knowledge system that allows users to store thoughts and query them using natural language. Implemented semantic search using vector embeddings and LLM-based summarization.

---

## 📄 License

MIT

---

*Built by [tayalharsh58-droid](https://github.com/tayalharsh58-droid)*
