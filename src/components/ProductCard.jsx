import { useNavigate } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ produto }) {
  const navigate = useNavigate();

  const imagem =
    produto.imagens?.[0] || produto.imagem;

  const tag =
    Array.isArray(produto.tags) &&
    produto.tags.length > 0
      ? produto.tags[produto.tags.length - 1]
      : produto.tag;

  const abrirProduto = () => {
    navigate(`/loja/produto/${produto.id}`);
  };

  return (
    <article className="product-card">

      <div
        className="product-image-container"
        onClick={abrirProduto}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            abrirProduto();
          }
        }}
      >

        {tag && (
          <span className="product-tag">
            {tag}
          </span>
        )}

        <button
          className="favorite-button"
          aria-label="Adicionar aos favoritos"
          onClick={(e) => e.stopPropagation()}
        >
          ♡
        </button>

        <img
          src={imagem}
          alt={produto.nome}
          className="product-image"
        />

        <button
          className="quick-add"
          onClick={(e) => {
            e.stopPropagation();
            abrirProduto();
          }}
        >
          Adicionar ao carrinho
        </button>

      </div>

      <div
        className="product-info"
        onClick={abrirProduto}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            abrirProduto();
          }
        }}
      >

        <span className="product-category">
          {produto.categoria}
        </span>

        <h3>{produto.nome}</h3>

        <div className="product-price">

          {produto.precoAntigo && (
            <span className="old-price">
              {produto.precoAntigo}
            </span>
          )}

          <span className="current-price">
            {produto.preco}
          </span>

        </div>

      </div>

    </article>
  );
}

export default ProductCard;