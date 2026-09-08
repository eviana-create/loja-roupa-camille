import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCarrinho } from "../context/CarrinhoContext";
import produtos from "../data/produtos";

import "./Carrinho.css";

function formatarPreco(valor) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function Carrinho() {
  const navigate = useNavigate();

  const {
    itens,
    removerItem,
    aumentarQuantidade,
    diminuirQuantidade,
    subtotal,
    limparCarrinho,
    adicionarItem,
  } = useCarrinho();

  const [coresAbertas, setCoresAbertas] = useState({});

  const alternarCores = (itemId) => {
    setCoresAbertas((estadoAtual) => ({
      ...estadoAtual,
      [itemId]: !estadoAtual[itemId],
    }));
  };

  const adicionarOutraCor = (item, cor) => {
    const produto = produtos.find(
      (produtoAtual) =>
        produtoAtual.id === item.produtoId
    );

    if (!produto) {
      alert("Produto não encontrado.");
      return;
    }

    if (cor === item.cor) {
      return;
    }

    const adicionado = adicionarItem({
      produto,
      tamanho: item.tamanho,
      cor,
      quantidade: 1,
    });

    if (adicionado) {
      setCoresAbertas((estadoAtual) => ({
        ...estadoAtual,
        [item.id]: false,
      }));
    }
  };

  if (itens.length === 0) {
    return (
      <main className="carrinho-page">
        <section className="carrinho-vazio">
          <span className="carrinho-label">
            SEU CARRINHO
          </span>

          <h1>
            Seu carrinho está vazio.
          </h1>

          <p>
            Encontre suas peças favoritas
            e adicione ao carrinho.
          </p>

          <button
            onClick={() => navigate("/loja")}
          >
            CONTINUAR COMPRANDO
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="carrinho-page">

      <div className="carrinho-header">

        <div>
          <span className="carrinho-label">
            SEU CARRINHO
          </span>

          <h1>
            Suas escolhas.
          </h1>
        </div>

        <button
          className="limpar-carrinho"
          onClick={limparCarrinho}
        >
          Limpar carrinho
        </button>

      </div>

      <section className="carrinho-container">

        <div className="carrinho-itens">

          {itens.map((item) => {

            const totalItem =
              item.preco * item.quantidade;

            const produto = produtos.find(
              (produtoAtual) =>
                produtoAtual.id === item.produtoId
            );

            const coresDisponiveis =
              produto?.cores || [];

            const outrasCores =
              coresDisponiveis.filter(
                (cor) => cor.nome !== item.cor
              );

            const seletorAberto =
              coresAbertas[item.id];

            return (
              <article
                className="carrinho-item"
                key={item.id}
              >

                {/* IMAGEM */}

                <div className="carrinho-item-imagem">

                  <img
                    src={item.imagem}
                    alt={item.nome}
                  />

                </div>

                {/* INFORMAÇÕES */}

                <div className="carrinho-item-info">

                  <span className="carrinho-item-categoria">
                    Produto
                  </span>

                  <h2>
                    {item.nome}
                  </h2>

                  {/* DETALHES */}

                  <div className="carrinho-item-detalhes">

                    <span>
                      Cor:{" "}
                      <strong>
                        {item.cor}
                      </strong>
                    </span>

                    <span>
                      Tamanho:{" "}
                      <strong>
                        {item.tamanho}
                      </strong>
                    </span>

                  </div>

                  {/* SELETOR DE COR */}

                  {outrasCores.length > 0 && (

                    <div className="carrinho-outra-cor">

                      <button
                        type="button"
                        className="outra-cor-toggle"
                        onClick={() =>
                          alternarCores(item.id)
                        }
                      >
                        <span>
                          {seletorAberto
                            ? "Fechar opções"
                            : "Adicionar outra cor"}
                        </span>

                        <span
                          className={
                            seletorAberto
                              ? "outra-cor-seta aberta"
                              : "outra-cor-seta"
                          }
                        >
                          ↓
                        </span>
                      </button>

                      {seletorAberto && (

                        <div className="outras-cores">

                          <span className="outras-cores-label">
                            Escolha outra cor
                          </span>

                          <div className="outras-cores-lista">

                            {outrasCores.map(
                              (cor) => (

                                <button
                                  type="button"
                                  key={cor.nome}
                                  className="outra-cor-opcao"
                                  onClick={() =>
                                    adicionarOutraCor(
                                      item,
                                      cor.nome
                                    )
                                  }
                                >

                                  <span
                                    className="outra-cor-circulo"
                                    style={{
                                      backgroundColor:
                                        cor.codigo,
                                    }}
                                  />

                                  <span>
                                    {cor.nome}
                                  </span>

                                </button>

                              )
                            )}

                          </div>

                        </div>

                      )}

                    </div>

                  )}

                  {/* PREÇO */}

                  <span className="carrinho-item-preco">
                    {formatarPreco(item.preco)}
                  </span>

                  {/* AÇÕES */}

                  <div className="carrinho-item-acoes">

                    <div className="carrinho-quantidade">

                      <button
                        onClick={() =>
                          diminuirQuantidade(item.id)
                        }
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>

                      <span>
                        {item.quantidade}
                      </span>

                      <button
                        onClick={() =>
                          aumentarQuantidade(item.id)
                        }
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>

                    </div>

                    <button
                      className="remover-item"
                      onClick={() =>
                        removerItem(item.id)
                      }
                    >
                      Remover
                    </button>

                  </div>

                </div>

                {/* TOTAL DO ITEM */}

                <div className="carrinho-item-total">
                  {formatarPreco(totalItem)}
                </div>

              </article>
            );
          })}

        </div>

        {/* RESUMO */}

        <aside className="carrinho-resumo">

          <span className="resumo-label">
            RESUMO DA COMPRA
          </span>

          <div className="resumo-linha">

            <span>
              Subtotal
            </span>

            <strong>
              {formatarPreco(subtotal)}
            </strong>

          </div>

          <div className="resumo-linha">

            <span>
              Entrega
            </span>

            <span>
              Calculada no checkout
            </span>

          </div>

          <div className="resumo-total">

            <span>
              Total
            </span>

            <strong>
              {formatarPreco(subtotal)}
            </strong>

          </div>

          <button
            className="finalizar-compra"
            onClick={() => navigate("/checkout")}
          >
            FINALIZAR COMPRA
          </button>
          
          <button
            className="continuar-comprando"
            onClick={() => navigate("/loja")}
          >
            ← Continuar comprando
          </button>

        </aside>

      </section>

    </main>
  );
}

export default Carrinho;