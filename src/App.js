import React from "react";
import PasswordGate from "./PasswordGate";
import WatchWithHilalApp from "./WatchWithHilalApp";

function App() {
  return (
    <PasswordGate>
      <WatchWithHilalApp />
    </PasswordGate>
  );
}

export default App;
