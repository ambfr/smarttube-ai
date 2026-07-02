# 🎯 SkipTheFluff

An AI-powered YouTube video discovery app that ranks results by actual quality — not just views or likes.

🔗 **Live demo:** https://skipthefluff-omega.vercel.app

---

## What does it do?

You search any topic — "learn Python", "sourdough bread recipe", "beginner guitar" — and instead of showing you the most popular video, SkipTheFluff actually reads the comments, analyzes the transcript, and ranks results by how good they genuinely are.

It also filters out YouTube Shorts from your main results and shows them separately, so you always get full-length quality videos first.

Sign in with Google or email to save videos you want to come back to.

---

## Screenshots

**Home Page**

![Home Page](screenshots/home-pg.png)

**Sign In**

![Login](screenshots/loginpopup.png)

**Saved Videos**

![Saved](screenshots/savedpg.png)

**Search Results**

![Search Results](screenshots/searchres.png)

---

## Features

- **AI-powered ranking** — scores every video across engagement, freshness, channel trust, and duration fit
- **Comment sentiment analysis** — reads real YouTube comments and extracts quality signals like "Clear explanation" or "Too much padding"
- **Transcript content classification** — Groq reads the actual video transcript to check if it genuinely teaches what the title claims (filters out reaction/commentary videos)
- **Shorts separation** — YouTube Shorts are detected and shown in their own horizontal row, not mixed into ranked results
- **Google + email auth** — sign in either way, JWT sessions
- **Saved videos** — bookmark any video to your personal saved list, stored in MongoDB
- **Tips panel** — built-in guide on how to get the best results out of the app
- **Mobile responsive** — works on phone and desktop

---

## How the ranking works

Each video gets a composite score (0–100) built from:

| Signal | What it measures |
|---|---|
| Engagement rate | Likes ÷ views ratio (not raw view count) |
| Freshness | How recently the video was uploaded |
| Channel trust | Proxy based on overall view count |
| Duration fit | Whether the video length matches what you're searching for |
| Comment sentiment | What real viewers say about the video quality |
| Transcript analysis | Whether the video actually teaches vs just talks about the topic |

Videos that score well across all these are ranked first — not just the ones with the most clicks.

---

## Built With

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI + Python
- **Database:** MongoDB Atlas
- **Video data:** YouTube Data API v3
- **AI:** Groq API (Llama 3.3 70B) — free tier
- **Transcripts:** youtube-transcript-api
- **Auth:** Google OAuth + email/password with JWT
- **Deployment:** Vercel (frontend) + Render (backend)

---

## How to Run This Yourself

You'll need API keys for YouTube, Groq, MongoDB, and Google OAuth before starting.

### 1. Clone the repo

```bash
git clone https://github.com/ambfr/skipthefluff.git
cd skipthefluff
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder:

```
YOUTUBE_API_KEY=your_youtube_api_key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skipthefluff
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=any_long_random_string
```

Start the backend:

```bash
uvicorn app.main:app --reload
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend/` folder:

```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend:

```bash
npm run dev
```

Open http://localhost:5173

---

## Where to get each API key

| Key | Where to get it |
|---|---|
| `YOUTUBE_API_KEY` | Google Cloud Console → APIs & Services → YouTube Data API v3 → Credentials |
| `MONGODB_URI` | mongodb.com/atlas → free M0 cluster → Connect → Drivers |
| `GROQ_API_KEY` | console.groq.com → API Keys |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials → OAuth 2.0 Client ID |

---

## Project Structure

```
skipthefluff/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── rank.py              # Main ranking endpoint
│   │   │   ├── auth.py              # Google + email login
│   │   │   └── saved.py             # Save/unsave videos
│   │   ├── services/
│   │   │   ├── youtube.py           # YouTube Data API calls
│   │   │   ├── scoring.py           # Composite scoring engine
│   │   │   ├── comments.py          # Fetch video comments
│   │   │   ├── sentiment.py         # Groq comment analysis
│   │   │   ├── transcript.py        # Fetch video transcripts
│   │   │   ├── content_analysis.py  # Groq transcript classification
│   │   │   ├── auth.py              # JWT + password hashing
│   │   │   └── groq.py              # Groq API calls
│   │   ├── models/
│   │   │   ├── video.py             # Video + ranked video models
│   │   │   ├── user.py              # User models
│   │   │   └── saved.py             # Saved video models
│   │   ├── database.py              # MongoDB connection
│   │   ├── config.py                # Environment settings
│   │   ├── dependencies.py          # Auth dependency injection
│   │   └── main.py                  # FastAPI app + CORS
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Nav + auth state
│   │   │   ├── SearchBar.jsx        # Search input + tips panel
│   │   │   ├── VideoCard.jsx        # Ranked video card
│   │   │   ├── ShortCard.jsx        # YouTube Shorts card
│   │   │   ├── SavedPage.jsx        # Saved videos view
│   │   │   ├── StatsBar.jsx         # Search stats footer
│   │   │   └── AuthModal.jsx        # Login/signup modal
│   │   ├── services/
│   │   │   ├── api.js               # Rank endpoint
│   │   │   ├── authApi.js           # Auth endpoints
│   │   │   └── savedApi.js          # Saved endpoints
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state
│   │   └── App.jsx                  # Main app + view routing
│   └── package.json
└── screenshots/
```

---

## Notes

- Render's free tier spins down after inactivity — the first search after a period of no use may take 30–60 seconds while the backend wakes up. Subsequent searches are fast.
- YouTube's free API quota is 10,000 units/day. Each search costs ~200 units. That's ~50 searches/day before hitting the limit.
- Groq's free tier is generous but has a requests-per-minute cap. Searches make up to 15 Groq calls so back-to-back rapid searches may slow down briefly.

---

## What's Next

- Caching layer — store recent search results in MongoDB to reduce API calls and speed up repeat searches
- Search history — let signed-in users see their past searches
- Share a result — shareable link for a ranked result set

---

## About This Project

SkipTheFluff was built as a portfolio project to practice full-stack development — combining a React frontend, FastAPI backend, multi-layer AI pipeline, Google OAuth, MongoDB, and YouTube API integration into one cohesive app.
