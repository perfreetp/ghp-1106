import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import MainMenu from "@/pages/MainMenu";
import HeroBook from "@/pages/HeroBook";
import Settings from "@/pages/Settings";
import LineupEditor from "@/pages/LineupEditor";
import LevelMap from "@/pages/LevelMap";
import Shop from "@/pages/Shop";
import Replay from "@/pages/Replay";
import BattleBoard from "@/pages/BattleBoard";
import { useGameStore } from "@/store/useGameStore";

export default function App() {
  const initNewGame = useGameStore((s) => s.initNewGame);

  useEffect(() => {
    initNewGame();
  }, [initNewGame]);

  return (
    <Router>
      <div className="game-bg min-h-screen">
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/heroes" element={<HeroBook />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/map" element={<LevelMap />} />
          <Route path="/lineup" element={<LineupEditor />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/replay" element={<Replay />} />
          <Route path="/battle/:levelId" element={<BattleBoard />} />
        </Routes>
      </div>
    </Router>
  );
}

