<div align="center">

```
 ██████╗ ██████╗ ██████╗ ███████╗    ██████╗ ██╗   ██╗███████╗██╗
██╔════╝██╔═══██╗██╔══██╗██╔════╝    ██╔══██╗██║   ██║██╔════╝██║
██║     ██║   ██║██║  ██║█████╗      ██║  ██║██║   ██║█████╗  ██║
██║     ██║   ██║██║  ██║██╔══╝      ██║  ██║██║   ██║██╔══╝  ██║
     ╚██████╗╚██████╔╝██████╔╝███████╗    ██████╔╝╚██████╔╝███████╗███████╗
      ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
```

**Real-time competitive coding — write code, duel opponents, claim the crown.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express.js-Backend-gray?style=for-the-badge&logo=express)](https://expressjs.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--time-010101?style=for-the-badge&logo=socketdotio)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Judge0](https://img.shields.io/badge/Judge0-Code%20Execution-blueviolet?style=for-the-badge)](https://judge0.com)

</div>

---

## What is CodeDuel?

CodeDuel is a real-time 1v1 (and tournament) competitive coding platform. Two players are given the same problem and race to solve it. Code is executed live against hidden test cases via Judge0. ELO ratings shift after every match. Spectators can watch both editors simultaneously as the battle unfolds.

It's built on a **Next.js App Router** frontend and a separate **Express.js** backend, connected by Socket.io for all the real-time state — match events, live code updates, spectator feeds, and tournament bracket progression.

---

## Features

### Dueling
- **Live 1v1 matches** — both players write code in a Monaco editor; test cases run on Judge0 in real time
- **Multi-language support** — JavaScript, Python, C++ (GCC 9.2), Java, and more via Judge0
- **Real-time progress bars** — visible to both the player and any spectators as test cases pass
- **ELO ranking system** — ratings update automatically after every match result

### Lobby & Matchmaking
- Public lobby showing all online players with their ELO, status, and language preference
- Challenge specific players or queue for auto-matchmaking
- AI bot opponents with adjustable ELO restrictions for practice
- Contextual "Find Your Game" UX that adapts copy based on ranked vs. casual mode

### Tournaments
- Create brackets with any number of players
- Single-elimination bracket with auto-generated connector lines and round progression
- Live tournament cards with a real-time remaining-player counter per current round
- Register for upcoming tournaments; bracket auto-advances after each match result
- Hero stats row: live count, active matches, upcoming scheduled, total players competing
- Champion banner and winner reveal on tournament completion
- Socket-based bracket updates pushed to every client watching

### Spectator Mode
- Watch any live match with read-only Monaco editors for both players
- Floating **Live Feed** panel showing timestamped match events in real time
- **Match timer** ticking from the moment the match starts
- **LEADING** badge + teal glow on whichever player is ahead in test-case progress
- Language pill and ELO displayed per player
- Custom `duelDark` Monaco theme matching the platform's visual identity


### Practice
- Dedicated practice mode with no ELO on the line — ideal for warming up or learning a new language
- Problems filterable by difficulty (Easy / Medium / Hard) and topic (Arrays, Trees, DP, Graphs, etc.)
- Solve against AI bots at adjustable skill levels to build confidence before ranked play
- Submission history per problem so you can revisit and improve past solutions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, CSS Modules |
| Backend | Node.js, Express.js |
| Real-time | Socket.io |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Code Execution | Judge0 REST API (self-hosted or `ce.judge0.com`) |
| Database | MongoDB (Mongoose) |
| Auth | JWT (stored in HTTP-only cookies) |

---

## Project Structure

```
codeduel/
├── frontend/                  # Next.js App Router
│   ├── app/
│   │   ├── lobby/             # Matchmaking lobby
│   │   ├── match/[id]/        # Live duel page
│   │   ├── tournaments/       # Tournament browser + bracket viewer
│   │   └── spectate/          # Spectate modal entry point
│   ├── components/
│   │   ├── PlayerCard.jsx
│   │   ├── SpectateModal.jsx
│   │   └── Hero.jsx
│   ├── context/
│   │   └── authContext.js
│   └── lib/
│       ├── api.js             # Axios instance (points to backend)
│       └── socket.js          # Shared Socket.io client
│
└── backend/                   # Express.js API
    ├── routes/
    │   ├── auth.js
    │   ├── matches.js
    │   ├── tournaments.js
    │   └── problems.js
    ├── models/
    │   ├── User.js
    │   ├── Match.js
    │   ├── Tournament.js
    │   └── Problem.js
    ├── services/
    │   └── codeExecutor.js    # Judge0 integration
    └── socket/
        └── index.js           # All socket event handlers
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB (local instance or MongoDB Atlas connection string)
- Judge0 instance — for development you can use the public `https://ce.judge0.com` endpoint (rate-limited); for production, [self-host Judge0](https://github.com/judge0/judge0/blob/master/CHANGELOG.md)

### 1 — Clone

```bash
git clone https://github.com/your-username/codeduel.git
cd codeduel
```

### 2 — Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/codeduel
JWT_SECRET=your_jwt_secret_here
JUDGE0_URL=https://ce.judge0.com        # or your self-hosted instance
CLIENT_URL=http://localhost:3000
```

Start the server:

```bash
npm run dev
```

### 3 — Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables Reference

### Backend

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign auth tokens |
| `JUDGE0_URL` | Base URL of your Judge0 instance |
| `CLIENT_URL` | Frontend URL (used for CORS) |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | Backend Socket.io URL |

---

## Supported Languages

| Language | Judge0 ID |
|---|---|
| JavaScript (Node.js) | 63 |
| Python 3 | 71 |
| C++ (GCC 9.2) | 54 |
| Java (OpenJDK 13) | 62 |

Additional languages can be enabled by adding their Judge0 language IDs to `codeExecutor.js`.

---

## Design System

All UI is built on a consistent dark purple palette — no third-party component library.

| Token | Value | Usage |
|---|---|---|
| Background primary | `#15121f` | Page backgrounds |
| Background card | `#1c1530 → #100e1c` | Cards, panels |
| Accent purple | `#a992d6` / `#b89cff` | Headings, active states |
| Accent teal | `#5dcaa5` | Success, progress fills |
| Accent coral | `#f0997b` | Warnings, VS labels |
| Accent gold | `#f7c948` | Champion, timers |
| Heading font | Big Shoulders (700–900) | All display text |
| Mono font | Chivo Mono (300–600) | UI labels, code hints |

Editor theme: custom Monaco `duelDark` — background `#13101f`, purple line numbers and cursor, matching selection highlight.

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `match:join` | Client → Server | Player joins a match room |
| `match:codeUpdate` | Client → Server | Broadcasts live code to opponent |
| `match:submit` | Client → Server | Triggers Judge0 execution |
| `match:result` | Server → Client | Winner declared, ELO updated |
| `spectate:join` | Client → Server | Join a match as a spectator |
| `spectate:leave` | Client → Server | Leave the spectator room |
| `spectate:codeUpdate` | Server → Client | Code update pushed to spectators |
| `spectate:progressUpdate` | Server → Client | Test-case progress pushed to spectators |
| `spectate:event` | Server → Client | Timestamped feed event |
| `tournament:update` | Server → Client | Bracket state pushed to all viewers |
| `lobby:update` | Server → Client | Online player list refresh |

---

## Contributing

Pull requests are welcome. For significant changes please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a pull request

Please keep the existing code style and design tokens consistent.

---


---

<div align="center">

Built with obsession by **Ananya** &nbsp;·&nbsp; dark themes only &nbsp;·&nbsp; may the faster coder win

</div>
