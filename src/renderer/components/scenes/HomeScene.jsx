import React from "react";
import { useAppState } from "../../state/StateProvider";

export default function HomeScene() {
  const { goToScene } = useAppState();

  return (
    <div className="container">
      <h1 tabIndex={0}>Helen Keller Archives</h1>
      
      <h4 tabIndex={0}>Choose a Theme from Helen Keller's Life</h4>
      
      <div className="menu-list">
        <button className="menu-link" disabled>Advocacy and Change</button>
        <button className="menu-link" disabled>Relationships Together</button>
        <button 
          className="menu-link" 
          onClick={() => goToScene("travel")}
        >
          Travel and Adventure
        </button>
        <button className="menu-link" disabled>Employment and Work</button>
      </div>
      
      <nav>
        <button 
          className="nav-btn icon-btn"
          onClick={() => goToScene("accessibility")}
          aria-label="Accessibility Settings"
        >
          <img src="settingsCog.svg" alt="" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}

