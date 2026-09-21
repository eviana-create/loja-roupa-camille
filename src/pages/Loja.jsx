import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import ProductCard from "../components/ProductCard";
import "./Loja.css";

function Loja() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setCarregando(true);
        setErro("");

        const snapshot = await getDocs(collection(db, "produtos"));

        const produtosFirestore = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Mantém a estrutura esperada pelos componentes atuais
        const produtosFormatados = produtosFirestore.map((produto) => ({
          id: produto.id,
          nome: produto.nome || "Produto sem nome",
          descricao: produto.descricao || "",
          categoria: produto.categoria || "Outros",

          preco:
            typeof produto.preco === "number"
              ? produto.preco
              : Number(produto.preco) || 0,

          precoPromocional:
            produto.precoPromocional !== null &&
            produto.precoPromocional !== undefined
              ? Number(produto.precoPromocional)
              : null,

          imagens: Array.isArray(produto.imagens)
            ? produto.imagens
            : [],

          tamanhos: Array.isArray(produto.tamanhos)
            ? produto.tamanhos
            : [],

          cores: Array.isArray(produto.cores)
            ? produto.cores
            : [],

          estoque: produto.estoque || {},

          tags: Array.isArray(produto.tags)
            ? produto.tags
            : [],

          destaque: produto.destaque === true,
          oferta: produto.oferta === true,
          ativo: produto.ativo !== false,
        }));

        // Só produtos ativos aparecem na loja
        setProdutos(
          produtosFormatados.filter((produto) => produto.ativo)
        );
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        setErro("Não foi possível carregar os produtos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, []);

  const categorias = useMemo(() => {
    return [
      "Todos",
      ...new Set(
        produtos
          .map((produto) => produto.categoria)
          .filter(Boolean)
      ),
    ];
  }, [produtos]);

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
  }, [produtos, busca, categoria]);

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

        {!carregando && !erro && (
          <span className="produto-count">
            {produtosFiltrados.length}{" "}
            {produtosFiltrados.length === 1
              ? "produto"
              : "produtos"}
          </span>
        )}

      </section>

      {/* CARREGANDO */}

      {carregando && (
        <section className="sem-produtos">
          <span>
            Carregando produtos...
          </span>
        </section>
      )}

      {/* ERRO */}

      {!carregando && erro && (
        <section className="sem-produtos">
          <span>
            {erro}
          </span>
        </section>
      )}

      {/* CONTEÚDO */}

      {!carregando && !erro && (
        <>

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

        </>
      )}

    </main>
  );
}

export default Loja;
