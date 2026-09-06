import ProductCard from "./ProductCard";
import "./Products.css";

const produtos = [
  {
    id: 1,
    nome: "Camiseta Oversized",
    categoria: "Camisetas",
    preco: "R$ 79,90",
    tag: "Novidade",
    imagem:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
  },
  {
    id: 2,
    nome: "Calça Wide Leg",
    categoria: "Calças",
    preco: "R$ 129,90",
    tag: "Destaque",
    imagem:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
  },
  {
    id: 3,
    nome: "Vestido Minimal",
    categoria: "Vestidos",
    preco: "R$ 149,90",
    precoAntigo: "R$ 189,90",
    tag: "Oferta",
    imagem:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
  },
  {
    id: 4,
    nome: "Jaqueta Casual",
    categoria: "Jaquetas",
    preco: "R$ 199,90",
    tag: "Novidade",
    imagem:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5",
  },
];

function Products() {
  return (
    <section className="products" id="novidades">

      <div className="products-header">

        <div>
          <span className="section-label">
            NOSSA SELEÇÃO
          </span>

          <h2>
            Novidades
          </h2>
        </div>

        <a href="#produtos" className="view-all">
          Ver todos
          <span>→</span>
        </a>

      </div>

      <div className="products-grid">

        {produtos.map((produto) => (
          <ProductCard
            key={produto.id}
            produto={produto}
          />
        ))}

      </div>

    </section>
  );
}

export default Products;