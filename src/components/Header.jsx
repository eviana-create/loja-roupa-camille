import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useCarrinho } from "../context/CarrinhoContext";

import "./Header.css";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { quantidadeTotal } = useCarrinho();

  const voltarAoTopo = () => {
    setMenuAberto(false);

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      return;
    }

    navigate("/");
  };

  const irParaLoja = () => {
    setMenuAberto(false);
    navigate("/loja");
  };

  const irParaCarrinho = () => {
    setMenuAberto(false);
    navigate("/carrinho");
  };

  return (
    <header className="header">

      <div className="header-container">

        {/* MENU MOBILE */}

        <button
          className="menu-button"
          onClick={() =>
            setMenuAberto(!menuAberto)
          }
          aria-label="Abrir menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* LOGO */}

        <button
          type="button"
          className="logo"
          onClick={voltarAoTopo}
        >
          DIVA VITORIA
          <br />
          FASHION
        </button>

        {/* MENU DESKTOP */}

        <nav className="desktop-nav">

          <button
            type="button"
            onClick={voltarAoTopo}
          >
            Início
          </button>

          <a href="/#feminino">
            Feminino
          </a>

          <a href="/#masculino">
            Masculino
          </a>

          <a href="/#acessorios">
            Acessórios
          </a>

          <a href="/#ofertas">
            Ofertas
          </a>

        </nav>

        {/* AÇÕES */}

        <div className="header-actions">

          {/* PESQUISA */}

          <button
            className="icon-button"
            aria-label="Pesquisar"
            onClick={irParaLoja}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="M20 20l-4-4" />
            </svg>
          </button>

          {/* CARRINHO */}

          <button
            className="icon-button cart-button"
            aria-label="Carrinho"
            onClick={irParaCarrinho}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />

              <circle
                cx="10"
                cy="20"
                r="1"
              />

              <circle
                cx="18"
                cy="20"
                r="1"
              />
            </svg>

            {quantidadeTotal > 0 && (
              <span className="cart-count">
                {quantidadeTotal}
              </span>
            )}

          </button>

        </div>

      </div>

      {/* MENU MOBILE */}

      <div
        className={`mobile-menu ${
          menuAberto ? "open" : ""
        }`}
      >

        <button
          type="button"
          onClick={voltarAoTopo}
        >
          Início
        </button>

        <a
          href="/#feminino"
          onClick={() =>
            setMenuAberto(false)
          }
        >
          Feminino
        </a>

        <a
          href="/#masculino"
          onClick={() =>
            setMenuAberto(false)
          }
        >
          Masculino
        </a>

        <a
          href="/#acessorios"
          onClick={() =>
            setMenuAberto(false)
          }
        >
          Acessórios
        </a>

        <a
          href="/#ofertas"
          onClick={() =>
            setMenuAberto(false)
          }
        >
          Ofertas
        </a>

        <button
          type="button"
          onClick={irParaLoja}
        >
          Ver produtos
        </button>

        <button
          type="button"
          onClick={irParaCarrinho}
        >
          Carrinho
          {quantidadeTotal > 0 &&
            ` (${quantidadeTotal})`}
        </button>

      </div>

    </header>
  );
}

export default Header;