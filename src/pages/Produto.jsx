import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import produtos from "../data/produtos";
import { useCarrinho } from "../context/CarrinhoContext";

import "./Produto.css";

function Produto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { adicionarItem } = useCarrinho();

  const produto = produtos.find(
    (item) => item.id === id
  );

  const [tamanhoSelecionado, setTamanhoSelecionado] =
    useState(null);

  const [corSelecionada, setCorSelecionada] =
    useState(
      produto?.cores?.[0]?.nome || null
    );

  const [quantidade, setQuantidade] = useState(1);

  if (!produto) {
    return (
      <main className="produto-nao-encontrado">

        <span>PRODUTO</span>

        <h1>
          Produto não encontrado.
        </h1>

        <button
          onClick={() => navigate("/loja")}
        >
          Voltar para a loja
        </button>

      </main>
    );
  }

  const precoAtual =
    produto.precoPromocional || produto.preco;

  const temPromocao =
    produto.precoPromocional !== null;

  const estoqueAtual =
    tamanhoSelecionado
      ? produto.estoque[tamanhoSelecionado] || 0
      : null;

  const aumentarQuantidade = () => {
    if (
      estoqueAtual &&
      quantidade < estoqueAtual
    ) {
      setQuantidade(quantidade + 1);
    }
  };

  const diminuirQuantidade = () => {
    if (quantidade > 1) {
      setQuantidade(quantidade - 1);
    }
  };

  const adicionarAoCarrinho = () => {
  if (!tamanhoSelecionado) {
    alert("Selecione um tamanho.");
    return;
  }

  if (!corSelecionada) {
    alert("Selecione uma cor.");
    return;
  }

  if (estoqueAtual <= 0) {
    alert("Este tamanho está esgotado.");
    return;
  }

  adicionarItem({
    produto,
    tamanho: tamanhoSelecionado,
    cor: corSelecionada,
    quantidade,
  });

  alert(
    `${produto.nome} foi adicionado ao carrinho!`
  );
};

  return (
    <main className="produto-page">

      {/* VOLTAR */}

      <button
        className="produto-voltar"
        onClick={() => navigate("/loja")}
      >
        ← Voltar para a loja
      </button>

      <section className="produto-container">

        {/* IMAGEM */}

        <div className="produto-imagem-container">

          <img
            src={produto.imagens[0]}
            alt={produto.nome}
            className="produto-imagem"
          />

        </div>

        {/* INFORMAÇÕES */}

        <div className="produto-info">

          <span className="produto-categoria">
            {produto.categoria}
          </span>

          <h1>
            {produto.nome}
          </h1>

          <div className="produto-precos">

            {temPromocao && (
              <span className="produto-preco-antigo">
                R$ {produto.preco
                  .toFixed(2)
                  .replace(".", ",")}
              </span>
            )}

            <span className="produto-preco">
              R$ {precoAtual
                .toFixed(2)
                .replace(".", ",")}
            </span>

          </div>

          <p className="produto-descricao">
            {produto.descricao}
          </p>

          {/* COR */}

          <div className="produto-opcao">

            <div className="opcao-header">
              <span>
                Cor
              </span>

              <strong>
                {corSelecionada}
              </strong>
            </div>

            <div className="cores">

              {produto.cores.map((cor) => (

                <button
                  key={cor.nome}
                  className={
                    corSelecionada === cor.nome
                      ? "cor ativo"
                      : "cor"
                  }
                  style={{
                    backgroundColor: cor.codigo,
                  }}
                  onClick={() =>
                    setCorSelecionada(cor.nome)
                  }
                  aria-label={cor.nome}
                  title={cor.nome}
                />

              ))}

            </div>

          </div>

          {/* TAMANHO */}

          <div className="produto-opcao">

            <div className="opcao-header">
              <span>
                Tamanho
              </span>

              {tamanhoSelecionado && (
                <strong>
                  {tamanhoSelecionado}
                </strong>
              )}
            </div>

            <div className="tamanhos">

              {produto.tamanhos.map((tamanho) => {

                const estoque =
                  produto.estoque[tamanho] || 0;

                const esgotado =
                  estoque <= 0;

                return (
                  <button
                    key={tamanho}
                    disabled={esgotado}
                    className={
                      tamanhoSelecionado === tamanho
                        ? "tamanho ativo"
                        : "tamanho"
                    }
                    onClick={() => {
                      setTamanhoSelecionado(tamanho);
                      setQuantidade(1);
                    }}
                  >
                    {tamanho}
                  </button>
                );

              })}

            </div>

          </div>

          {/* ESTOQUE */}

          {tamanhoSelecionado && (

            <div className="produto-estoque">

              {estoqueAtual > 0 ? (
                <>
                  <span className="estoque-ponto"></span>

                  {estoqueAtual}{" "}
                  {estoqueAtual === 1
                    ? "unidade disponível"
                    : "unidades disponíveis"}
                </>
              ) : (
                "Tamanho esgotado"
              )}

            </div>

          )}

          {/* QUANTIDADE */}

          {tamanhoSelecionado &&
            estoqueAtual > 0 && (

              <div className="produto-quantidade">

                <span>
                  Quantidade
                </span>

                <div className="quantidade-controle">

                  <button
                    onClick={diminuirQuantidade}
                  >
                    −
                  </button>

                  <span>
                    {quantidade}
                  </span>

                  <button
                    onClick={aumentarQuantidade}
                    disabled={
                      quantidade >= estoqueAtual
                    }
                  >
                    +
                  </button>

                </div>

              </div>

            )}

          {/* BOTÃO */}

          <button
            className="produto-adicionar"
            onClick={adicionarAoCarrinho}
          >
            ADICIONAR AO CARRINHO
          </button>

          <div className="produto-beneficios">

            <div>
              <strong>Compra segura</strong>
              <span>
                Seus dados protegidos.
              </span>
            </div>

            <div>
              <strong>Pagamento fácil</strong>
              <span>
                Diversas formas de pagamento.
              </span>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Produto;