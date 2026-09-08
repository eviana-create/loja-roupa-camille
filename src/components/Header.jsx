import { useState } from "react";
import "./Header.css";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="header">
      <div className="header-container">

        {/* MENU MOBILE */}
        <button
          className="menu-button"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Abrir menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* LOGO */}
        <a href="/" className="logo">
          DIVA VITORIA 
          <br/>FASHION
        </a>

        {/* MENU DESKTOP */}
        <nav className="desktop-nav">
          <a href="/">Início</a>
          <a href="#feminino">Feminino</a>
          <a href="#masculino">Masculino</a>
          <a href="#acessorios">Acessórios</a>
          <a href="#ofertas">Ofertas</a>
        </nav>

        {/* AÇÕES */}
        <div className="header-actions">

          <button className="icon-button" aria-label="Pesquisar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
          </button>

          <button className="icon-button cart-button" aria-label="Carrinho">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>

            <span className="cart-count">0</span>
          </button>

        </div>
      </div>

      {/* MENU MOBILE */}
      <div className={`mobile-menu ${menuAberto ? "open" : ""}`}>

        <a href="/" onClick={() => setMenuAberto(false)}>
          Início
        </a>

        <a href="#feminino" onClick={() => setMenuAberto(false)}>
          Feminino
        </a>

        <a href="#masculino" onClick={() => setMenuAberto(false)}>
          Masculino
        </a>

        <a href="#acessorios" onClick={() => setMenuAberto(false)}>
          Acessórios
        </a>

        <a href="#ofertas" onClick={() => setMenuAberto(false)}>
          Ofertas
        </a>

      </div>
    </header>
  );
}

export default Header;