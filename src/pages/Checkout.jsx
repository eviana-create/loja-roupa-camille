import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCarrinho } from "../context/CarrinhoContext";

import "./Checkout.css";

function formatarPreco(valor) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function formatarCEP(valor) {
  const apenasNumeros = valor.replace(/\D/g, "");

  if (apenasNumeros.length <= 5) {
    return apenasNumeros;
  }

  return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(
    5,
    8
  )}`;
}

function Checkout() {
  const navigate = useNavigate();

  const {
    itens,
    subtotal,
    limparCarrinho,
  } = useCarrinho();

  const [formaEntrega, setFormaEntrega] =
    useState("entrega");

  const [pagamento, setPagamento] =
    useState("pix");

  const [buscandoCep, setBuscandoCep] =
    useState(false);

  const [mensagemCep, setMensagemCep] =
    useState("");

  const [dados, setDados] = useState({
    nome: "",
    whatsapp: "",
    email: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const atualizarCampo = (campo, valor) => {
    setDados((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: valor,
    }));
  };

  const buscarCEP = async (cepDigitado) => {
    const cep = cepDigitado.replace(/\D/g, "");

    if (cep.length !== 8) {
      setMensagemCep("");
      return;
    }

    setBuscandoCep(true);
    setMensagemCep("");

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );

      if (!resposta.ok) {
        throw new Error("Erro ao consultar CEP.");
      }

      const endereco = await resposta.json();

      if (endereco.erro) {
        setMensagemCep("CEP não encontrado.");

        setDados((dadosAtuais) => ({
          ...dadosAtuais,
          rua: "",
          bairro: "",
          cidade: "",
          estado: "",
        }));

        return;
      }

      setDados((dadosAtuais) => ({
        ...dadosAtuais,
        rua: endereco.logradouro || "",
        bairro: endereco.bairro || "",
        cidade: endereco.localidade || "",
        estado: endereco.uf || "",
      }));

      setMensagemCep("Endereço encontrado.");
    } catch (erro) {
      console.error(erro);

      setMensagemCep(
        "Não foi possível consultar o CEP. Preencha o endereço manualmente."
      );
    } finally {
      setBuscandoCep(false);
    }
  };

  const alterarCEP = (valor) => {
    const cepFormatado = formatarCEP(valor);

    atualizarCampo("cep", cepFormatado);

    const cepNumeros =
      cepFormatado.replace(/\D/g, "");

    if (cepNumeros.length === 8) {
      buscarCEP(cepFormatado);
    } else {
      setMensagemCep("");
    }
  };

  const finalizarPedido = (e) => {
    e.preventDefault();

    if (itens.length === 0) {
      alert("Seu carrinho está vazio.");
      navigate("/loja");
      return;
    }

    if (!dados.nome.trim()) {
      alert("Informe seu nome.");
      return;
    }

    if (!dados.whatsapp.trim()) {
      alert("Informe seu WhatsApp.");
      return;
    }

    if (formaEntrega === "entrega") {
      if (
        !dados.cep.trim() ||
        !dados.rua.trim() ||
        !dados.numero.trim() ||
        !dados.bairro.trim() ||
        !dados.cidade.trim() ||
        !dados.estado.trim()
      ) {
        alert(
          "Preencha todos os dados de entrega."
        );
        return;
      }
    }

    const numeroPedido =
        `DVF-${Math.floor(1000 + Math.random() * 9000)}`;

      navigate("/pedido-confirmado", {
        state: {
          numeroPedido,
          itens,
          subtotal,
          formaEntrega,
          pagamento,
          dados,
        },
      });

      limparCarrinho();
  };

  if (itens.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-vazio">
          <span className="checkout-label">
            CHECKOUT
          </span>

          <h1>
            Seu carrinho está vazio.
          </h1>

          <p>
            Adicione produtos antes de continuar
            para o checkout.
          </p>

          <button
            onClick={() => navigate("/loja")}
          >
            VOLTAR PARA A LOJA
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">

      <div className="checkout-header">

        <button
          type="button"
          className="checkout-voltar"
          onClick={() => navigate("/carrinho")}
        >
          ← Voltar para o carrinho
        </button>

        <span className="checkout-label">
          FINALIZAÇÃO
        </span>

        <h1>
          Finalize sua compra.
        </h1>

        <p>
          Preencha seus dados para concluir
          seu pedido.
        </p>

      </div>

      <form
        className="checkout-container"
        onSubmit={finalizarPedido}
      >

        <div className="checkout-form">

          <section className="checkout-section">

            <div className="checkout-section-header">
              <span>01</span>

              <div>
                <h2>
                  Seus dados
                </h2>

                <p>
                  Precisamos dessas informações
                  para entrar em contato com você.
                </p>
              </div>
            </div>

            <div className="checkout-grid">

              <label className="checkout-campo campo-completo">
                <span>
                  Nome completo
                </span>

                <input
                  type="text"
                  value={dados.nome}
                  onChange={(e) =>
                    atualizarCampo(
                      "nome",
                      e.target.value
                    )
                  }
                  placeholder="Seu nome completo"
                />
              </label>

              <label className="checkout-campo">
                <span>
                  WhatsApp
                </span>

                <input
                  type="tel"
                  value={dados.whatsapp}
                  onChange={(e) =>
                    atualizarCampo(
                      "whatsapp",
                      e.target.value
                    )
                  }
                  placeholder="(11) 99999-9999"
                />
              </label>

              <label className="checkout-campo">
                <span>
                  E-mail
                </span>

                <input
                  type="email"
                  value={dados.email}
                  onChange={(e) =>
                    atualizarCampo(
                      "email",
                      e.target.value
                    )
                  }
                  placeholder="seu@email.com"
                />
              </label>

            </div>

          </section>

          <section className="checkout-section">

            <div className="checkout-section-header">
              <span>02</span>

              <div>
                <h2>
                  Entrega
                </h2>

                <p>
                  Escolha como deseja receber
                  seu pedido.
                </p>
              </div>
            </div>

            <div className="checkout-opcoes">

              <button
                type="button"
                className={
                  formaEntrega === "entrega"
                    ? "checkout-opcao ativo"
                    : "checkout-opcao"
                }
                onClick={() =>
                  setFormaEntrega("entrega")
                }
              >
                <strong>
                  Entrega
                </strong>

                <span>
                  Receba no endereço informado.
                </span>
              </button>

              <button
                type="button"
                className={
                  formaEntrega === "retirada"
                    ? "checkout-opcao ativo"
                    : "checkout-opcao"
                }
                onClick={() =>
                  setFormaEntrega("retirada")
                }
              >
                <strong>
                  Retirada
                </strong>

                <span>
                  Retire seu pedido em local combinado.
                </span>
              </button>

            </div>

            {formaEntrega === "entrega" && (

              <div className="checkout-grid">

                <label className="checkout-campo">
                  <span>
                    CEP
                  </span>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={dados.cep}
                    onChange={(e) =>
                      alterarCEP(e.target.value)
                    }
                    placeholder="00000-000"
                  />

                  {buscandoCep && (
                    <small className="cep-status">
                      Buscando endereço...
                    </small>
                  )}

                  {!buscandoCep &&
                    mensagemCep && (
                      <small
                        className={
                          mensagemCep ===
                          "Endereço encontrado."
                            ? "cep-status sucesso"
                            : "cep-status erro"
                        }
                      >
                        {mensagemCep}
                      </small>
                    )}
                </label>

                <label className="checkout-campo campo-completo">
                  <span>
                    Rua
                  </span>

                  <input
                    type="text"
                    value={dados.rua}
                    onChange={(e) =>
                      atualizarCampo(
                        "rua",
                        e.target.value
                      )
                    }
                    placeholder="Nome da rua"
                  />
                </label>

                <label className="checkout-campo">
                  <span>
                    Número
                  </span>

                  <input
                    type="text"
                    value={dados.numero}
                    onChange={(e) =>
                      atualizarCampo(
                        "numero",
                        e.target.value
                      )
                    }
                    placeholder="123"
                  />
                </label>

                <label className="checkout-campo">
                  <span>
                    Complemento
                  </span>

                  <input
                    type="text"
                    value={dados.complemento}
                    onChange={(e) =>
                      atualizarCampo(
                        "complemento",
                        e.target.value
                      )
                    }
                    placeholder="Apto, bloco..."
                  />
                </label>

                <label className="checkout-campo">
                  <span>
                    Bairro
                  </span>

                  <input
                    type="text"
                    value={dados.bairro}
                    onChange={(e) =>
                      atualizarCampo(
                        "bairro",
                        e.target.value
                      )
                    }
                    placeholder="Seu bairro"
                  />
                </label>

                <label className="checkout-campo">
                  <span>
                    Cidade
                  </span>

                  <input
                    type="text"
                    value={dados.cidade}
                    onChange={(e) =>
                      atualizarCampo(
                        "cidade",
                        e.target.value
                      )
                    }
                    placeholder="Sua cidade"
                  />
                </label>

                <label className="checkout-campo">
                  <span>
                    Estado
                  </span>

                  <input
                    type="text"
                    value={dados.estado}
                    onChange={(e) =>
                      atualizarCampo(
                        "estado",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="SP"
                    maxLength={2}
                  />
                </label>

              </div>

            )}

          </section>

          <section className="checkout-section">

            <div className="checkout-section-header">
              <span>03</span>

              <div>
                <h2>
                  Pagamento
                </h2>

                <p>
                  Escolha sua forma de pagamento.
                </p>
              </div>
            </div>

            <div className="checkout-pagamentos">

              <button
                type="button"
                className={
                  pagamento === "pix"
                    ? "checkout-pagamento ativo"
                    : "checkout-pagamento"
                }
                onClick={() =>
                  setPagamento("pix")
                }
              >
                <strong>
                  Pix
                </strong>

                <span>
                  Pagamento instantâneo
                </span>
              </button>

              <button
                type="button"
                className={
                  pagamento === "cartao"
                    ? "checkout-pagamento ativo"
                    : "checkout-pagamento"
                }
                onClick={() =>
                  setPagamento("cartao")
                }
              >
                <strong>
                  Cartão
                </strong>

                <span>
                  Crédito ou débito
                </span>
              </button>

              <button
                type="button"
                className={
                  pagamento === "dinheiro"
                    ? "checkout-pagamento ativo"
                    : "checkout-pagamento"
                }
                onClick={() =>
                  setPagamento("dinheiro")
                }
              >
                <strong>
                  Dinheiro
                </strong>

                <span>
                  Pagamento na retirada
                </span>
              </button>

            </div>

          </section>

        </div>

        <aside className="checkout-resumo">

          <span className="resumo-label">
            SEU PEDIDO
          </span>

          <div className="checkout-resumo-itens">

            {itens.map((item) => (

              <div
                className="checkout-resumo-item"
                key={item.id}
              >

                <div className="checkout-resumo-imagem">

                  <img
                    src={item.imagem}
                    alt={item.nome}
                  />

                </div>

                <div className="checkout-resumo-info">

                  <strong>
                    {item.nome}
                  </strong>

                  <span>
                    {item.cor} · {item.tamanho}
                  </span>

                  <span>
                    Qtd. {item.quantidade}
                  </span>

                </div>

                <strong>
                  {formatarPreco(
                    item.preco *
                      item.quantidade
                  )}
                </strong>

              </div>

            ))}

          </div>

          <div className="checkout-resumo-linha">

            <span>
              Subtotal
            </span>

            <strong>
              {formatarPreco(subtotal)}
            </strong>

          </div>

          <div className="checkout-resumo-linha">

            <span>
              Entrega
            </span>

            <span>
              A combinar
            </span>

          </div>

          <div className="checkout-resumo-total">

            <span>
              Total
            </span>

            <strong>
              {formatarPreco(subtotal)}
            </strong>

          </div>

          <button
            type="submit"
            className="checkout-finalizar"
          >
            FINALIZAR PEDIDO
          </button>

          <p className="checkout-seguranca">
            Seus dados serão utilizados apenas
            para processar seu pedido.
          </p>

        </aside>

      </form>

    </main>
  );
}

export default Checkout;