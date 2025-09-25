import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { WorldEditor } from "./world/components/WorldEditor";
import GeneticLearning from "./geneticAlgorithm/geneticLearning";

const App: React.FC = () => {
  return (
    <Router>
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <nav style={{ padding: "10px", background: "#222", color: "#fff" }}>
          <Link
            to="/"
            style={{
              marginRight: "15px",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            World Editor
          </Link>
          <Link to="/ai" style={{ color: "#fff", textDecoration: "none" }}>
            AI Learning
          </Link>
        </nav>

        <div style={{ flex: 1, overflow: "hidden" }}>
          <Routes>
            <Route path="/" element={<WorldEditor />} />
            <Route path="/ai" element={<GeneticLearning />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
