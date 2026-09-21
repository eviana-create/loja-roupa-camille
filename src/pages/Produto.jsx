import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

import { useCarrinho } from "../context/CarrinhoContext";

import "./Produto.css";

function Produto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { adicionarItem } = useCarrinho();

  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] =
    useState(true);

  const [
    imagemSelecionada,
    setImagemSelecionada,
  ] = useState(0);

  const [
    tamanhoSelecionado,
    setTamanhoSelecionado,
  ] = useState(null);

  const [
    corSelecionada,
    setCorSelecionada,
  ] = useState(null);

  const [quantidade, setQuantidade] =
    useState(1);

  useEffect(() => {
    async function carregarProduto() {
      try {
        setCarregando(true);

        const referenciaProduto = doc(
          db,
          "produtos",
          id
        );

        const documento =
          await getDoc(referenciaProduto);

        if (!documento.exists()) {
          setProduto(null);
          return;
        }

        const dados = documento.data();

        const produtoFirebase = {
          id: documento.id,

          nome:
            dados.nome ||
            "Produto sem nome",

          descricao:
            dados.descricao || "",

          categoria:
            dados.categoria ||
            "Outros",

          preco:
            typeof dados.preco === "number"
              ? dados.preco
              : Number(dados.preco) || 0,

          precoPromocional:
            dados.precoPromocional !==
              null &&
            dados.precoPromocional !==
              undefined
              ? Number(
                  dados.precoPromocional
                )
              : null,

          imagens:
            Array.isArray(dados.imagens)
              ? dados.imagens
              : [],

          tamanhos:
            Array.isArray(dados.tamanhos)
              ? dados.tamanhos
              : [],

          cores:
            Array.isArray(dados.cores)
              ? dados.cores
              : [],

          estoque:
            dados.estoque || {},

          tags:
            Array.isArray(dados.tags)
              ? dados.tags
              : [],

          destaque:
            dados.destaque === true,

          oferta:
            dados.oferta === true,

          ativo:
            dados.ativo !== false,
        };

        setProduto(produtoFirebase);

        setCorSelecionada(
          produtoFirebase.cores?.[0]?.nome ||
            null
        );
      } catch (error) {
        console.error(
          "Erro ao carregar produto:",
          error
        );

        setProduto(null);
      } finally {
        setCarregando(false);
      }
    }

    if (id) {
      carregarProduto();
    }
  }, [id]);

  if (carregando) {
    return (
      <main className="produto-nao-encontrado">
        <div>
          <span>PRODUTO</span>

          <h1>
            Carregando produto...
          </h1>

          <p>
            Aguarde enquanto carregamos
            os detalhes da peça.
          </p>
        </div>
      </main>
    );
  }

  if (!produto || produto.ativo === false) {
    return (
      <main className="produto-nao-encontrado">
        <div>
          <span>PRODUTO</span>

          <h1>
            Produto não encontrado
          </h1>

          <p>
            O produto que você está procurando
            não está disponível.
          </p>

          <button
            onClick={() =>
              navigate("/loja")
            }
          >
            Voltar para a loja
          </button>
        </div>
      </main>
    );
  }

  const precoAtual =
    produto.precoPromocional ??
    produto.preco;

  const temPromocao =
    produto.precoPromocional !== null &&
    produto.precoPromocional !==
      undefined;

  const estoqueDisponivel =
    tamanhoSelecionado
      ? produto.estoque?.[
          tamanhoSelecionado
        ] || 0
      : null;

  const aumentarQuantidade = () => {
    const limite =
      estoqueDisponivel ?? 99;

    if (quantidade < limite) {
      setQuantidade(
        (valor) => valor + 1
      );
    }
  };

  const diminuirQuantidade = () => {
    if (quantidade > 1) {
      setQuantidade(
        (valor) => valor - 1
      );
    }
  };

  const adicionarAoCarrinho = () => {
    if (
      produto.tamanhos?.length > 0 &&
      !tamanhoSelecionado
    ) {
      alert("Selecione um tamanho.");
      return;
    }

    if (
      produto.cores?.length > 0 &&
      !corSelecionada
    ) {
      alert("Selecione uma cor.");
      return;
    }

    if (
      tamanhoSelecionado &&
      estoqueDisponivel <= 0
    ) {
      alert("Este tamanho está esgotado.");
      return;
    }

    const adicionado =
      adicionarItem({
        produto,
        tamanho:
          tamanhoSelecionado,
        cor: corSelecionada,
        quantidade,
      });

    if (adicionado) {
      navigate("/carrinho");
    }
  };

  return (
    <main className="produto-page">

      {/* BREADCRUMB */}

      <div className="produto-breadcrumb">

        <button
          onClick={() =>
            navigate("/loja")
          }
        >
          Loja
        </button>

        <span>/</span>

        <span>
          {produto.categoria}
        </span>

        <span>/</span>

        <strong>
          {produto.nome}
        </strong>

      </div>

      {/* PRODUTO */}

      <section className="produto-container">

        {/* GALERIA */}

        <div className="produto-galeria">

          <div className="produto-miniaturas">

            {produto.imagens?.map(
              (imagem, index) => (

                <button
                  key={index}
                  className={
                    imagemSelecionada ===
                    index
                      ? "miniatura ativa"
                      : "miniatura"
                  }
                  onClick={() =>
                    setImagemSelecionada(
                      index
                    )
                  }
                  aria-label={`Ver imagem ${
                    index + 1
                  }`}
                >

                  <img
                    src={imagem}
                    alt={`${produto.nome} ${
                      index + 1
                    }`}
                  />

                </button>
              )
            )}

          </div>

          <div className="produto-imagem-principal">

            {produto.tags?.[0] && (
              <span className="produto-tag">
                {produto.tags[0]}
              </span>
            )}

            <button
              className="produto-favorito"
              aria-label="Adicionar aos favoritos"
            >
              ♡
            </button>

            <img
              src={
                produto.imagens?.[
                  imagemSelecionada
                ] ||
                produto.imagem
              }
              alt={produto.nome}
            />

          </div>

        </div>

        {/* DETALHES */}

        <div className="produto-detalhes">

          <span className="produto-categoria">
            {produto.categoria}
          </span>

          <h1>
            {produto.nome}
          </h1>

          {/* PREÇOS */}

          <div className="produto-precos">

            {temPromocao && (
              <span className="produto-preco-antigo">
                R${" "}
                {produto.preco
                  .toFixed(2)
                  .replace(
                    ".",
                    ","
                  )}
              </span>
            )}

            <span className="produto-preco-atual">
              R${" "}
              {precoAtual
                .toFixed(2)
                .replace(
                  ".",
                  ","
                )}
            </span>

            {temPromocao && (
              <span className="produto-oferta">
                OFERTA
              </span>
            )}

          </div>

          <div className="produto-divisor" />

          {/* DESCRIÇÃO */}

          <div className="produto-descricao">

            <h2>
              Descrição
            </h2>

            <p>
              {produto.descricao}
            </p>

          </div>

          {/* CORES */}

          {produto.cores?.length > 0 && (

            <div className="produto-opcao">

              <div className="opcao-titulo">

                <span>
                  Cor
                </span>

                <strong>
                  {corSelecionada}
                </strong>

              </div>

              <div className="cores">

                {produto.cores.map(
                  (cor) => (

                    <button
                      key={cor.nome}
                      className={
                        corSelecionada ===
                        cor.nome
                          ? "cor-bolinha selecionada"
                          : "cor-bolinha"
                      }
                      style={{
                        backgroundColor:
                          cor.codigo,
                      }}
                      onClick={() =>
                        setCorSelecionada(
                          cor.nome
                        )
                      }
                      aria-label={
                        cor.nome
                      }
                      title={
                        cor.nome
                      }
                    />

                  )
                )}

              </div>

            </div>

          )}

          {/* TAMANHOS */}

          {produto.tamanhos?.length > 0 && (

            <div className="produto-opcao">

              <div className="opcao-titulo">

                <span>
                  Tamanho
                </span>

                <button
                  className="guia-tamanho"
                  type="button"
                >
                  Guia de tamanhos
                </button>

              </div>

              <div className="tamanhos">

                {produto.tamanhos.map(
                  (tamanho) => {

                    const estoque =
                      produto.estoque?.[
                        tamanho
                      ] || 0;

                    const indisponivel =
                      estoque <= 0;

                    return (
                      <button
                        key={tamanho}
                        disabled={
                          indisponivel
                        }
                        className={
                          tamanhoSelecionado ===
                          tamanho
                            ? "tamanho selecionado"
                            : "tamanho"
                        }
                        onClick={() => {
                          setTamanhoSelecionado(
                            tamanho
                          );

                          setQuantidade(1);
                        }}
                      >

                        {tamanho}

                        {indisponivel && (
                          <small>
                            Esgotado
                          </small>
                        )}

                      </button>
                    );
                  }
                )}

              </div>

            </div>

          )}

          {/* QUANTIDADE */}

          <div className="produto-opcao">

            <div className="opcao-titulo">

              <span>
                Quantidade
              </span>

              {estoqueDisponivel !==
                null && (
                <small>
                  {estoqueDisponivel}{" "}
                  disponíveis
                </small>
              )}

            </div>

            <div className="quantidade">

              <button
                type="button"
                onClick={
                  diminuirQuantidade
                }
                disabled={
                  quantidade <= 1
                }
              >
                −
              </button>

              <span>
                {quantidade}
              </span>

              <button
                type="button"
                onClick={
                  aumentarQuantidade
                }
                disabled={
                  estoqueDisponivel !==
                    null &&
                  quantidade >=
                    estoqueDisponivel
                }
              >
                +
              </button>

            </div>

          </div>

          {/* ADICIONAR */}

          <button
            className="produto-adicionar"
            onClick={
              adicionarAoCarrinho
            }
          >
            Adicionar ao carrinho

            <span>
              →
            </span>
          </button>

          {/* BENEFÍCIOS */}

          <div className="produto-beneficios">

            <div>
              <span>✓</span>

              <p>
                Compra segura
              </p>
            </div>

            <div>
              <span>✓</span>

              <p>
                Produto disponível
              </p>
            </div>

            <div>
              <span>✓</span>

              <p>
                Envio para todo o Brasil
              </p>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Produto;
