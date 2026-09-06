import "./ProductCard.css";

function ProductCard({ produto }) {
  return (
    <article className="product-card">

      <div className="product-image-container">

        {produto.tag && (
          <span className="product-tag">
            {produto.tag}
          </span>
        )}

        <button
          className="favorite-button"
          aria-label="Adicionar aos favoritos"
        >
          ♡
        </button>

        <img
          src={produto.imagem}
          alt={produto.nome}
          className="product-image"
        />

        <button className="quick-add">
          Adicionar ao carrinho
        </button>

      </div>

      <div className="product-info">

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