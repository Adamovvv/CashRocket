import { useEffect, useMemo, useState } from "react";

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const DEFAULT_BALANCE = 1000;

function randomMines(count) {
  const mines = new Set();
  while (mines.size < count) {
    mines.add(Math.floor(Math.random() * TOTAL_CELLS));
  }
  return mines;
}

function getMultiplier(safeOpened, mineCount) {
  if (safeOpened <= 0) return 1;
  const riskFactor = 1 + mineCount * 0.08;
  return Number((1 + safeOpened * 0.15 * riskFactor).toFixed(2));
}

function App() {
  const tg = window.Telegram?.WebApp;
  const firstName = tg?.initDataUnsafe?.user?.first_name || "Игрок";

  const [activeTab, setActiveTab] = useState("home");
  const [balance, setBalance] = useState(DEFAULT_BALANCE);
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [started, setStarted] = useState(false);
  const [mines, setMines] = useState(new Set());
  const [openedCells, setOpenedCells] = useState(new Set());
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, [tg]);

  const safeOpened = openedCells.size;
  const multiplier = useMemo(() => getMultiplier(safeOpened, mineCount), [safeOpened, mineCount]);
  const potentialWin = Number((bet * multiplier).toFixed(2));

  const startRound = () => {
    if (bet <= 0 || bet > balance) return;
    const nextMines = randomMines(mineCount);
    setBalance((prev) => Number((prev - bet).toFixed(2)));
    setMines(nextMines);
    setOpenedCells(new Set());
    setStarted(true);
    setStatus("playing");
  };

  const revealCell = (idx) => {
    if (!started || status !== "playing") return;
    if (openedCells.has(idx)) return;

    if (mines.has(idx)) {
      setStatus("lost");
      setStarted(false);
      return;
    }

    const next = new Set(openedCells);
    next.add(idx);
    setOpenedCells(next);
  };

  const cashout = () => {
    if (status !== "playing" || safeOpened === 0) return;
    setBalance((prev) => Number((prev + potentialWin).toFixed(2)));
    setStarted(false);
    setStatus("won");
  };

  const resetGame = () => {
    setStarted(false);
    setMines(new Set());
    setOpenedCells(new Set());
    setStatus("idle");
  };

  const isRevealed = (idx) => {
    if (status === "lost") return mines.has(idx) || openedCells.has(idx);
    return openedCells.has(idx);
  };

  return (
    <div className="app-shell">
      <header className="top-card">
        <div>
          <p className="muted">CashRocket мини-приложение</p>
          <h1>Привет, {firstName} ??</h1>
        </div>
        <div className="balance-pill">?? {balance.toFixed(2)} ?</div>
      </header>

      <main className="content">
        {activeTab === "home" && (
          <section className="home-view">
            <div className="hero">
              <p className="muted">Пользователей онлайн: 9 180</p>
              <h2>Бюджет 3.000.000 ?</h2>
              <p>Выполняй задания и увеличивай баланс</p>
            </div>

            <div className="cards-grid">
              <article className="payout-card">
                <span className="muted">15:19</span>
                <strong>2 660 ?</strong>
                <small>O**** M******</small>
              </article>
              <article className="payout-card">
                <span className="muted">15:16</span>
                <strong>9 400 ?</strong>
                <small>H****** A******</small>
              </article>
            </div>

            <article className="task-card">
              <div className="task-avatar">??</div>
              <div>
                <h3>Поставить лайки</h3>
                <p className="muted">Выполнено: 1 из 1</p>
                <div className="done-badge">Выполнено</div>
              </div>
              <div className="task-price">150 ?</div>
            </article>
          </section>
        )}

        {activeTab === "mines" && (
          <section className="mines-view">
            <div className="mines-panel">
              <label>
                Ставка
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={bet}
                  onChange={(e) => setBet(Number(e.target.value) || 0)}
                  disabled={started}
                />
              </label>

              <label>
                Кол-во мин
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={mineCount}
                  onChange={(e) => setMineCount(Math.max(1, Math.min(24, Number(e.target.value) || 1)))}
                  disabled={started}
                />
              </label>

              <div className="stats">
                <span>Открыто: {safeOpened}</span>
                <span>Множитель: x{multiplier.toFixed(2)}</span>
                <span>Потенц. выигрыш: {potentialWin.toFixed(2)} ?</span>
              </div>

              <div className="actions">
                {!started ? (
                  <button className="btn-primary" onClick={startRound} disabled={bet <= 0 || bet > balance}>
                    Начать игру
                  </button>
                ) : (
                  <button className="btn-cashout" onClick={cashout} disabled={safeOpened === 0}>
                    Забрать {potentialWin.toFixed(2)} ?
                  </button>
                )}
                <button className="btn-ghost" onClick={resetGame}>Сброс</button>
              </div>

              {status === "lost" && <p className="status lost">Мина! Раунд проигран.</p>}
              {status === "won" && <p className="status won">Вы успешно забрали выигрыш.</p>}
            </div>

            <div className="grid">
              {Array.from({ length: TOTAL_CELLS }).map((_, idx) => {
                const revealed = isRevealed(idx);
                const mine = mines.has(idx);
                return (
                  <button
                    key={idx}
                    className={`cell ${revealed ? "revealed" : ""} ${revealed && mine ? "mine" : ""}`}
                    onClick={() => revealCell(idx)}
                    disabled={!started || revealed || status !== "playing"}
                  >
                    {revealed ? (mine ? "??" : "??") : ""}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>Главная</button>
        <button className={activeTab === "mines" ? "active" : ""} onClick={() => setActiveTab("mines")}>Мины</button>
      </nav>
    </div>
  );
}

export default App;
