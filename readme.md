# Financieri
**Open-source educational web game about personal finance and investing**

Financieri is a browser multiplayer simulation focused on long-term financial decisions (stocks, index funds, commodity exposure, deposits, pension pillars, and insurance). The game is still in development, but now has a cleaner real-time architecture and stronger in-game feedback loop.

---

## Current stack
- **Backend:** Node.js + Express + `ws` WebSocket server
- **Frontend:** HTML, vanilla JavaScript modules, Tailwind CSS, Chart.js
- **Data:** MySQL (`mysql2/promise`) historical tables used for simulated market ticks

---

## How to play (local)
1. Install **MySQL** and **Node.js**.
2. Create a database + user and import your SQL dataset.
3. Create `.env` from `template.env`.
4. (Optional) create SSL certs for HTTPS/WSS and place them in `internal_modules/webserver_modules/`.
5. Install dependencies and start:
   ```bash
   npm install
   npm start
   ```

---

## Development
### Run tests
```bash
npm test
```

### Notes
- Game rooms run a synchronized market tick every 5 seconds.
- Host controls match setup (playtime + semi-annual contribution).
- Player clients receive room/game events via WebSocket event routing.

---

## Status
Project is playable but not feature-complete. Contributions are welcome, especially around:
- economic mechanics,
- user onboarding,
- in-game actions (buy/sell flow),
- translation support and accessibility.
