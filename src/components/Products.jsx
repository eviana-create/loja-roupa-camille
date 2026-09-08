import produtos from "../data/produtos";
import ProductCard from "./ProductCard";
import "./Products.css";

function Products() {
  const produtosDestaque = produtos.filter(
    (produto) =>
      produto.ativo && produto.destaque
  );

  return (
    <section
      className="products"
      id="novidades"
    >
      <div className="products-header">

        <div>
          <span className="section-label">
            NOSSA SELEÇÃO
          </span>

          <h2>
            Novidades
          </h2>
        </div>

        <a
          href="/loja"
          className="view-all"
        >
          Ver todos
          <span>→</span>
        </a>

      </div>

      <div className="products-grid">

        {produtosDestaque.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={{
              ...produto,

              preco: produto.precoPromocional
                ? `R$ ${produto.precoPromocional
                    .toFixed(2)
                    .replace(".", ",")}`
                : `R$ ${produto.preco
                    .toFixed(2)
                    .replace(".", ",")}`,

              precoAntigo:
                produto.precoPromocional
                  ? `R$ ${produto.preco
                      .toFixed(2)
                      .replace(".", ",")}`
                  : null,
            }}
          />
        ))}

      </div>
    </section>
  );
}

export default Products;