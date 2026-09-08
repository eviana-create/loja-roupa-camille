import { useLocation, useNavigate } from "react-router-dom";

import "./PedidoConfirmado.css";

function formatarPreco(valor) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function gerarNumeroPedido() {
  const numero = Math.floor(1000 + Math.random() * 9000);

  return `DVF-${numero}`;
}

function PedidoConfirmado() {
  const navigate = useNavigate();
  const location = useLocation();

  const pedido = location.state;

  const numeroPedido =
    pedido?.numeroPedido || gerarNumeroPedido();

  const itens = pedido?.itens || [];
  const subtotal = pedido?.subtotal || 0;

  const formaEntrega =
    pedido?.formaEntrega || "entrega";

  const pagamento =
    pedido?.pagamento || "pix";

  const dados = pedido?.dados || {};

  const nomesPagamento = {
    pix: "Pix",
    cartao: "Cartão",
    dinheiro: "Dinheiro",
  };

  return (
    <main className="pedido-confirmado-page">

      <section className="pedido-confirmado">

        <div className="pedido-sucesso-icon">
          ✓
        </div>

        <span className="pedido-label">
          PEDIDO RECEBIDO
        </span>

        <h1>
          Obrigado pela sua compra.
        </h1>

        <p className="pedido-mensagem">
          Seu pedido foi recebido com sucesso.
          Em breve entraremos em contato pelo
          WhatsApp informado para confirmar
          os próximos passos.
        </p>

        <div className="pedido-numero">

          <span>
            NÚMERO DO PEDIDO
          </span>

          <strong>
            #{numeroPedido}
          </strong>

        </div>

        <div className="pedido-conteudo">

          <section className="pedido-detalhes">

            <div className="pedido-detalhes-header">

              <span>
                RESUMO
              </span>

              <h2>
                Sua compra
              </h2>

            </div>

            {itens.length > 0 ? (
              <div className="pedido-itens">

                {itens.map((item) => (

                  <div
                    className="pedido-item"
                    key={item.id}
                  >

                    <div className="pedido-item-imagem">

                      <img
                        src={item.imagem}
                        alt={item.nome}
                      />

                    </div>

                    <div className="pedido-item-info">

                      <strong>
                        {item.nome}
                      </strong>

                      <span>
                        {item.cor} · {item.tamanho}
                      </span>

                      <span>
                        Quantidade: {item.quantidade}
                      </span>

                    </div>

                    <strong className="pedido-item-preco">
                      {formatarPreco(
                        item.preco *
                          item.quantidade
                      )}
                    </strong>

                  </div>

                ))}

              </div>
            ) : (
              <p className="pedido-sem-itens">
                Os detalhes dos produtos serão
                disponibilizados no seu pedido.
              </p>
            )}

            <div className="pedido-total">

              <span>
                Total
              </span>

              <strong>
                {formatarPreco(subtotal)}
              </strong>

            </div>

          </section>

          <section className="pedido-dados">

            <div className="pedido-detalhes-header">

              <span>
                INFORMAÇÕES
              </span>

              <h2>
                Dados do pedido
              </h2>

            </div>

            {dados.nome && (
              <div className="pedido-dado">

                <span>
                  Cliente
                </span>

                <strong>
                  {dados.nome}
                </strong>

              </div>
            )}

            {dados.whatsapp && (
              <div className="pedido-dado">

                <span>
                  WhatsApp
                </span>

                <strong>
                  {dados.whatsapp}
                </strong>

              </div>
            )}

            <div className="pedido-dado">

              <span>
                Pagamento
              </span>

              <strong>
                {nomesPagamento[pagamento] ||
                  pagamento}
              </strong>

            </div>

            <div className="pedido-dado">

              <span>
                Recebimento
              </span>

              <strong>
                {formaEntrega === "retirada"
                  ? "Retirada"
                  : "Entrega"}
              </strong>

            </div>

            {formaEntrega === "entrega" &&
              dados.rua && (

                <div className="pedido-endereco">

                  <span>
                    ENDEREÇO DE ENTREGA
                  </span>

                  <p>
                    {dados.rua}, {dados.numero}
                    {dados.complemento &&
                      ` - ${dados.complemento}`}
                    <br />
                    {dados.bairro}
                    <br />
                    {dados.cidade} -{" "}
                    {dados.estado}
                    <br />
                    CEP: {dados.cep}
                  </p>

                </div>

              )}

          </section>

        </div>

        <div className="pedido-acoes">

          <button
            type="button"
            className="pedido-continuar"
            onClick={() => navigate("/loja")}
          >
            CONTINUAR COMPRANDO
          </button>

          <button
            type="button"
            className="pedido-inicio"
            onClick={() => navigate("/")}
          >
            VOLTAR PARA O INÍCIO
          </button>

        </div>

        <p className="pedido-observacao">
          Guarde o número do seu pedido para
          facilitar nosso atendimento.
        </p>

      </section>

    </main>
  );
}

export default PedidoConfirmado;