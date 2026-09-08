import { useMemo, useState } from "react";
import produtos from "../data/produtos";
import ProductCard from "../components/ProductCard";
import "./Loja.css";

function Loja() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");

  const categorias = [
    "Todos",
    ...new Set(produtos.map((produto) => produto.categoria)),
  ];

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      const correspondeCategoria =
        categoria === "Todos" ||
        produto.categoria === categoria;

      const textoBusca = busca.toLowerCase().trim();

      const correspondeBusca =
        produto.nome.toLowerCase().includes(textoBusca) ||
        produto.categoria.toLowerCase().includes(textoBusca);

      return correspondeCategoria && correspondeBusca;
    });
  }, [busca, categoria]);

  return (
    <main className="loja">

      {/* CABEÇALHO */}

      <section className="loja-header">

        <div>
          <span className="loja-label">
            NOSSA LOJA
          </span>

          <h1>
            Encontre seu estilo.
          </h1>

          <p>
            Explore nossa seleção de peças
            escolhidas para você.
          </p>
        </div>

        <span className="produto-count">
          {produtosFiltrados.length}{" "}
          {produtosFiltrados.length === 1
            ? "produto"
            : "produtos"}
        </span>

      </section>

      {/* CONTROLES */}

      <section className="loja-controls">

        <div className="busca-container">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>

          <input
            type="text"
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />

          {busca && (
            <button
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}

        </div>

        <div className="categorias-filtro">

          {categorias.map((item) => (
            <button
              key={item}
              className={
                categoria === item ? "ativo" : ""
              }
              onClick={() => setCategoria(item)}
            >
              {item}
            </button>
          ))}

        </div>

      </section>

      {/* PRODUTOS */}

      <section className="loja-produtos">

        {produtosFiltrados.length > 0 ? (

          <div className="loja-grid">

            {produtosFiltrados.map((produto) => (
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
                  precoAntigo: produto.precoPromocional
                    ? `R$ ${produto.preco
                        .toFixed(2)
                        .replace(".", ",")}`
                    : null,
                }}
              />
            ))}

          </div>

        ) : (

          <div className="sem-produtos">

            <span>
              Nenhum produto encontrado.
            </span>

            <button
              onClick={() => {
                setBusca("");
                setCategoria("Todos");
              }}
            >
              Limpar filtros
            </button>

          </div>

        )}

      </section>

    </main>
  );
}

export default Loja;