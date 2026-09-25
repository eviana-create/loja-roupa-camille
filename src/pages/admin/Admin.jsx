import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  deleteField,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebaseConfig";
import "./Admin.css";

const CLOUD_NAME = "xs7pnfwj";
const UPLOAD_PRESET = "diva-vitoria-produtos";

const PRAZO_HISTORICO_DIAS = 60;

const historicoObterDataCancelamento = (pedido) => {
  return pedido.canceladoEm?.toDate?.() || null;
};

const historicoDiasRestantes = (pedido) => {
  const dataCancelamento =
    historicoObterDataCancelamento(pedido);

  if (!dataCancelamento) {
    return null;
  }

  const dataExclusao = new Date(dataCancelamento);

  dataExclusao.setDate(
    dataExclusao.getDate() + PRAZO_HISTORICO_DIAS
  );

  const diferenca =
    dataExclusao.getTime() - new Date().getTime();

  return Math.max(
    0,
    Math.ceil(
      diferenca / (1000 * 60 * 60 * 24)
    )
  );
};

const historicoPodeExcluir = (pedido) => {
  if (pedido.status !== "cancelado") {
    return false;
  }

  const diasRestantes =
    historicoDiasRestantes(pedido);

  return diasRestantes === 0;
};

const historicoFormatarData = (timestamp) => {
  const data = timestamp?.toDate?.();

  if (!data) {
    return "Data não registrada";
  }

  return data.toLocaleDateString("pt-BR");
};

function Admin() {
  const [imagemTeste, setImagemTeste] = useState("");
  const [carregandoUpload, setCarregandoUpload] = useState(false);
  const [erroUpload, setErroUpload] = useState("");

  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [produtosAdmin, setProdutosAdmin] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [mostrarProdutos, setMostrarProdutos] = useState(false);
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] =
  useState(true);

  const [mostrarPedidos, setMostrarPedidos] =
  useState(false);

const [pedidosAdmin, setPedidosAdmin] =
  useState([]);

const [processandoPedido, setProcessandoPedido] =
  useState("");

const [carregandoPedidos, setCarregandoPedidos] =
  useState(false);

const [erroPedidos, setErroPedidos] =
  useState("");

const [pedidoSelecionado, setPedidoSelecionado] =
  useState(null);

const [filtroPedidos, setFiltroPedidos] = useState("ativos");
const [buscaPedidos, setBuscaPedidos] = useState("");
const [filtroStatusPedido, setFiltroStatusPedido] = useState("todos");
const PRAZO_HISTORICO_DIAS = 60;

  const dashboardRef = useRef(null);
  const [sucessoProduto, setSucessoProduto] = useState("");

  const [produtoEditando, setProdutoEditando] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [processandoProduto, setProcessandoProduto] = useState("");


  const [formulario, setFormulario] = useState({
    nome: "",
    descricao: "",
    categoria: "",
    preco: "",
    precoPromocional: "",
    tamanhos: [],
    cores: [],
    tags: [],
    destaque: false,
    oferta: false,
    ativo: true,
  });

  const [novoTamanho, setNovoTamanho] = useState("");
  const [novaCorNome, setNovaCorNome] = useState("");
  const [novaCorCodigo, setNovaCorCodigo] = useState("#111111");

  const [estoque, setEstoque] = useState({});

  const alterarCampo = (campo, valor) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  };

  const adicionarTamanho = () => {
    const tamanho = novoTamanho.trim().toUpperCase();

    if (!tamanho) return;

    if (formulario.tamanhos.includes(tamanho)) {
      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      tamanhos: [...anterior.tamanhos, tamanho],
    }));

    setEstoque((anterior) => ({
      ...anterior,
      [tamanho]: 0,
    }));

    setNovoTamanho("");
  };

  const removerTamanho = (tamanho) => {
    setFormulario((anterior) => ({
      ...anterior,
      tamanhos: anterior.tamanhos.filter(
        (item) => item !== tamanho
      ),
    }));

    setEstoque((anterior) => {
      const novoEstoque = { ...anterior };

      delete novoEstoque[tamanho];

      return novoEstoque;
    });
  };

  const alterarEstoque = (tamanho, valor) => {
    setEstoque((anterior) => ({
      ...anterior,
      [tamanho]: Number(valor),
    }));
  };

  const adicionarCor = () => {
    const nome = novaCorNome.trim();

    if (!nome) return;

    const corJaExiste = formulario.cores.some(
      (cor) =>
        cor.nome.toLowerCase() === nome.toLowerCase()
    );

    if (corJaExiste) {
      return;
    }

    setFormulario((anterior) => ({
      ...anterior,
      cores: [
        ...anterior.cores,
        {
          nome,
          codigo: novaCorCodigo,
        },
      ],
    }));

    setNovaCorNome("");
    setNovaCorCodigo("#111111");
  };

  const removerCor = (nome) => {
    setFormulario((anterior) => ({
      ...anterior,
      cores: anterior.cores.filter(
        (cor) => cor.nome !== nome
      ),
    }));
  };

const carregarProdutos = async () => {
  setCarregandoProdutos(true);
  setErroUpload("");

  try {
    const snapshot = await getDocs(
      collection(db, "produtos")
    );

    const produtos = snapshot.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    setProdutosAdmin(produtos);

    console.log(
      "PRODUTOS CARREGADOS DO FIREBASE:",
      produtos
    );

    return produtos;
  } catch (error) {
    console.error(
      "Erro ao carregar produtos:",
      error
    );

    setErroUpload(
      error.message ||
        "Não foi possível carregar os produtos."
    );

    return [];
  } finally {
    setCarregandoProdutos(false);
  }
};

const abrirProdutos = async () => {
  setMostrarProdutos(true);

  await carregarProdutos();
};

  const carregarPedidos = async () => {
  setCarregandoPedidos(true);
  setErroPedidos("");

  try {
    const snapshot = await getDocs(
      collection(db, "pedidos")
    );

    const pedidos = snapshot.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    }));

    pedidos.sort((a, b) => {
      const dataA =
        a.criadoEm?.toMillis?.() || 0;

      const dataB =
        b.criadoEm?.toMillis?.() || 0;

      return dataB - dataA;
    });

    setPedidosAdmin(pedidos);

    console.log(
      "PEDIDOS CARREGADOS DO FIREBASE:",
      pedidos
    );

    return pedidos;
  } catch (error) {
    console.error(
      "Erro ao carregar pedidos:",
      error
    );

    setErroPedidos(
      error.message ||
        "Não foi possível carregar os pedidos."
    );

    return [];
  } finally {
    setCarregandoPedidos(false);
  }
};

const abrirPedidos = async () => {
  setMostrarProdutos(false);
  setMostrarDashboard(false);
  setMostrarFormulario(false);

  setMostrarPedidos(true);
  setPedidoSelecionado(null);
  setBuscaPedidos("");
  setFiltroStatusPedido("todos");

  await carregarPedidos();
};

  useEffect(() => {
  carregarProdutos();
  carregarPedidos();
}, []);

const statusInfo = {
  aguardando_pagamento: {
    label: "Aguardando pagamento",
    background: "#fff4d6",
    color: "#8a6500",
  },

  pagamento_aprovado: {
    label: "Pagamento aprovado",
    background: "#edf8ef",
    color: "#286b35",
  },

  preparando: {
    label: "Preparando pedido",
    background: "#eaf2ff",
    color: "#245a9c",
  },

  enviado: {
    label: "Pedido enviado",
    background: "#eee9ff",
    color: "#6545a5",
  },

  entregue: {
    label: "Entregue",
    background: "#e6f7f1",
    color: "#1f7657",
  },

  cancelado: {
    label: "Cancelado",
    background: "#fcebea",
    color: "#a33",
  },
};

const obterProximoStatus = (pedido) => {
  if (pedido.status === "aguardando_pagamento") {
    return "pagamento_aprovado";
  }

  if (pedido.status === "pagamento_aprovado") {
    return "preparando";
  }

  if (pedido.status === "preparando") {
    return "enviado";
  }

  if (pedido.status === "enviado") {
    return "entregue";
  }

  return null;
};

const confirmarPagamentoEBaixarEstoque = async (
  pedido
) => {
  const pedidoRef = doc(
    db,
    "pedidos",
    pedido.id
  );

  const baixasPorProduto = {};

  const itens = Array.isArray(pedido.itens)
    ? pedido.itens
    : [];

  for (const item of itens) {
    const produtoId = item.produtoId;
    const tamanho = item.tamanho;
    const quantidade = Number(
      item.quantidade || 0
    );

    if (
      !produtoId ||
      !tamanho ||
      quantidade <= 0
    ) {
      throw new Error(
        "Existe um item do pedido com dados de estoque inválidos."
      );
    }

    if (!baixasPorProduto[produtoId]) {
      baixasPorProduto[produtoId] = {};
    }

    baixasPorProduto[produtoId][tamanho] =
      (baixasPorProduto[produtoId][tamanho] ||
        0) + quantidade;
  }

  await runTransaction(
    db,
    async (transaction) => {
      const pedidoSnapshot =
        await transaction.get(
          pedidoRef
        );

      if (!pedidoSnapshot.exists()) {
        throw new Error(
          "Pedido não encontrado no Firebase."
        );
      }

      const pedidoAtual =
        pedidoSnapshot.data();

      if (
        pedidoAtual.status !==
        "aguardando_pagamento"
      ) {
        throw new Error(
          "Este pedido não está aguardando pagamento."
        );
      }

      if (
        pedidoAtual.estoqueBaixado === true
      ) {
        throw new Error(
          "O estoque deste pedido já foi baixado."
        );
      }

      const produtosAtualizados = [];

      for (const produtoId of Object.keys(
        baixasPorProduto
      )) {
        const produtoRef = doc(
          db,
          "produtos",
          produtoId
        );

        const produtoSnapshot =
          await transaction.get(
            produtoRef
          );

        if (!produtoSnapshot.exists()) {
          throw new Error(
            `Produto ${produtoId} não foi encontrado.`
          );
        }

        const produto =
          produtoSnapshot.data();

        const estoqueAtual = {
          ...(produto.estoque || {}),
        };

        const baixas =
          baixasPorProduto[produtoId];

        for (const tamanho of Object.keys(
          baixas
        )) {
          const quantidadeAtual =
            Number(
              estoqueAtual[tamanho] || 0
            );

          const quantidadeBaixar =
            Number(baixas[tamanho] || 0);

          if (
            quantidadeAtual <
            quantidadeBaixar
          ) {
            throw new Error(
              `Estoque insuficiente para "${produto.nome}" no tamanho ${tamanho}. Disponível: ${quantidadeAtual}.`
            );
          }

          estoqueAtual[tamanho] =
            quantidadeAtual -
            quantidadeBaixar;
        }

        produtosAtualizados.push({
          produtoId,
          estoque: estoqueAtual,
        });

        transaction.update(
          produtoRef,
          {
            estoque: estoqueAtual,
          }
        );
      }

      transaction.update(
        pedidoRef,
        {
          status: "pagamento_aprovado",
          estoqueBaixado: true,
        }
      );
    }
  );

  return baixasPorProduto;
};

const pedidosAtivos = pedidosAdmin.filter(
  (pedido) =>
    pedido.status !== "cancelado" &&
    pedido.arquivado !== true
);

const pedidosHistorico = pedidosAdmin.filter(
  (pedido) =>
    pedido.status === "cancelado" ||
    pedido.arquivado === true
);

const pedidosExibidos =
  filtroPedidos === "historico"
    ? pedidosHistorico
    : pedidosAtivos;

const normalizarTextoPedido = (valor) =>
  String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const converterDataPedido = (valor) => {
  if (!valor) {
    return null;
  }

  if (typeof valor.toDate === "function") {
    return valor.toDate();
  }

  if (valor instanceof Date) {
    return valor;
  }

  if (typeof valor === "string") {
    const data = new Date(valor);

    if (!Number.isNaN(data.getTime())) {
      return data;
    }
  }

  return null;
};

const formatarDataPedidoCompleta = (valor) => {
  const data = converterDataPedido(valor);

  if (!data) {
    return "Data não disponível";
  }

  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const obterPagamentoLabel = (pagamento) => {
  if (pagamento === "pix") {
    return "Pix";
  }

  if (pagamento === "cartao") {
    return "Cartão";
  }

  if (pagamento === "dinheiro") {
    return "Dinheiro";
  }

  return pagamento || "Não informado";
};

const obterIndiceStatusPedido = (status) => {
  const ordem = [
    "aguardando_pagamento",
    "pagamento_aprovado",
    "preparando",
    "enviado",
    "entregue",
  ];

  return ordem.indexOf(status);
};

const pedidosFiltrados = pedidosExibidos.filter((pedido) => {
  const termo = normalizarTextoPedido(
    buscaPedidos.trim()
  );

  const correspondeBusca =
    !termo ||
    [
      pedido.numeroPedido,
      pedido.cliente?.nome,
      pedido.cliente?.whatsapp,
      pedido.cliente?.email,
    ].some((valor) =>
      normalizarTextoPedido(valor).includes(termo)
    );

  const correspondeStatus =
    filtroStatusPedido === "todos" ||
    pedido.status === filtroStatusPedido;

  return correspondeBusca && correspondeStatus;
});

const copiarParaAreaDeTransferencia = async (texto) => {
  if (!texto) {
    return;
  }

  try {
    await navigator.clipboard.writeText(texto);
    setErroPedidos("");
    alert("Informação copiada para a área de transferência.");
  } catch (error) {
    console.error("Erro ao copiar informação:", error);
    setErroPedidos(
      "Não foi possível copiar a informação. Tente novamente."
    );
  }
};

const abrirWhatsAppPedido = (pedido) => {
  const numero = String(
    pedido?.cliente?.whatsapp || ""
  ).replace(/\D/g, "");

  if (!numero) {
    setErroPedidos(
      "Este pedido não possui um WhatsApp cadastrado."
    );
    return;
  }

  window.open(
    `https://wa.me/55${numero}`,
    "_blank",
    "noopener,noreferrer"
  );
};

const abrirEmailPedido = (pedido) => {
  const email = String(
    pedido?.cliente?.email || ""
  ).trim();

  if (!email) {
    setErroPedidos(
      "Este pedido não possui um e-mail cadastrado."
    );
    return;
  }

  window.location.href =
    `mailto:${email}?subject=${encodeURIComponent(
      `Pedido ${pedido.numeroPedido || pedido.id}`
    )}`;
};

const obterDataCancelamento = (pedido) => {
  const valor = pedido?.canceladoEm;

  if (!valor) {
    return null;
  }

  // Timestamp do Firebase
  if (
    typeof valor.toDate === "function"
  ) {
    return valor.toDate();
  }

  // Date criado localmente pelo React
  if (
    valor instanceof Date
  ) {
    return valor;
  }

  // Caso o valor venha como texto
  if (
    typeof valor === "string"
  ) {
    const data = new Date(valor);

    if (!Number.isNaN(data.getTime())) {
      return data;
    }
  }

  return null;
};

const formatarDataHistorico = (
  timestamp
) => {
  let data = null;

  if (!timestamp) {
    return "Data não registrada";
  }

  // Timestamp do Firebase
  if (
    typeof timestamp.toDate === "function"
  ) {
    data = timestamp.toDate();
  }

  // Date normal
  else if (
    timestamp instanceof Date
  ) {
    data = timestamp;
  }

  // Texto
  else if (
    typeof timestamp === "string"
  ) {
    const dataConvertida =
      new Date(timestamp);

    if (
      !Number.isNaN(
        dataConvertida.getTime()
      )
    ) {
      data = dataConvertida;
    }
  }

  if (!data) {
    return "Data não registrada";
  }

  return data.toLocaleDateString(
    "pt-BR"
  );
};

const obterDiasRestantesHistorico = (pedido) => {
  const dataCancelamento =
    obterDataCancelamento(pedido);

  if (!dataCancelamento) {
    return null;
  }

  const dataLimite = new Date(
    dataCancelamento
  );

  dataLimite.setDate(
    dataLimite.getDate() +
      PRAZO_HISTORICO_DIAS
  );

  const diferenca =
    dataLimite.getTime() -
    new Date().getTime();

  return Math.max(
    0,
    Math.ceil(
      diferenca /
        (1000 * 60 * 60 * 24)
    )
  );
};

const podeExcluirPermanentemente = (
  pedido
) => {
  if (pedido.status !== "cancelado") {
    return false;
  }

  const dias =
    obterDiasRestantesHistorico(
      pedido
    );

  return dias === 0;
};


const reativarPedido = async (pedido) => {
  if (
    !pedido ||
    pedido.status !== "cancelado"
  ) {
    return;
  }

  const confirmar = window.confirm(
    `Deseja reativar o pedido #${
      pedido.numeroPedido || pedido.id
    }?`
  );

  if (!confirmar) {
    return;
  }

  setProcessandoPedido(pedido.id);
  setErroPedidos("");

  try {
    const novoStatus =
      pedido.statusAnterior &&
      pedido.statusAnterior !==
        "cancelado"
        ? pedido.statusAnterior
        : pedido.estoqueBaixado === true
          ? "pagamento_aprovado"
          : "aguardando_pagamento";

    await updateDoc(
      doc(
        db,
        "pedidos",
        pedido.id
      ),
      {
        status: novoStatus,
        arquivado: false,
        canceladoEm: null,
        statusAnterior: null,
      }
    );

    setPedidosAdmin(
      (anterior) =>
        anterior.map((item) =>
          item.id === pedido.id
            ? {
                ...item,
                status: novoStatus,
                arquivado: false,
                canceladoEm: null,
                statusAnterior: null,
              }
            : item
        )
    );

    setPedidoSelecionado(
      (anterior) =>
        anterior?.id === pedido.id
          ? {
              ...anterior,
              status: novoStatus,
              arquivado: false,
              canceladoEm: null,
              statusAnterior: null,
            }
          : anterior
    );

    setFiltroPedidos("ativos");

    console.log(
      "Pedido reativado:",
      pedido.numeroPedido,
      novoStatus
    );
  } catch (error) {
    console.error(
      "Erro ao reativar pedido:",
      error
    );

    setErroPedidos(
      error.message ||
        "Não foi possível reativar o pedido."
    );
  } finally {
    setProcessandoPedido("");
  }
};

const excluirPedidoPermanentemente = async (
  pedido
) => {
  if (
    !pedido ||
    pedido.status !== "cancelado"
  ) {
    return;
  }

  if (
    !podeExcluirPermanentemente(
      pedido
    )
  ) {
    const dias =
      obterDiasRestantesHistorico(
        pedido
      );

    alert(
      `A exclusão permanente ainda não está disponível.${
        dias !== null
          ? ` Faltam ${dias} dia${
              dias === 1
                ? ""
                : "s"
            }.`
          : ""
      }`
    );

    return;
  }

  const confirmar =
    window.confirm(
      `EXCLUSÃO PERMANENTE\n\nDeseja excluir definitivamente o pedido #${
        pedido.numeroPedido ||
        pedido.id
      }?\n\nEssa ação não poderá ser desfeita.`
    );

  if (!confirmar) {
    return;
  }

  setProcessandoPedido(pedido.id);
  setErroPedidos("");

  try {
    await deleteDoc(
      doc(
        db,
        "pedidos",
        pedido.id
      )
    );

    setPedidosAdmin(
      (anterior) =>
        anterior.filter(
          (item) =>
            item.id !== pedido.id
        )
    );

    if (
      pedidoSelecionado?.id ===
      pedido.id
    ) {
      setPedidoSelecionado(null);
    }

    console.log(
      "Pedido excluído permanentemente:",
      pedido.numeroPedido
    );
  } catch (error) {
    console.error(
      "Erro ao excluir pedido:",
      error
    );

    setErroPedidos(
      error.message ||
        "Não foi possível excluir o pedido."
    );
  } finally {
    setProcessandoPedido("");
  }
};

const alterarStatusPedido = async (
  pedido,
  novoStatus
) => {
  /*
   * O pagamento só pode ser confirmado
   * manualmente quando a forma de pagamento
   * for dinheiro.
   *
   * Pix ficará aguardando a futura confirmação
   * automática.
   */
  if (
    novoStatus === "pagamento_aprovado" &&
    pedido.pagamento !== "dinheiro"
  ) {
    setErroPedidos(
      "O pagamento via Pix será confirmado automaticamente quando a integração de pagamento estiver configurada."
    );

    return;
  }

  setProcessandoPedido(pedido.id);
  setErroPedidos("");

  try {
    let baixasPorProduto = null;

    /*
     * CONFIRMAÇÃO DO PAGAMENTO
     */
    if (
      novoStatus ===
      "pagamento_aprovado"
    ) {
      baixasPorProduto =
        await confirmarPagamentoEBaixarEstoque(
          pedido
        );
    }

    /*
     * CANCELAMENTO
     *
     * O pedido não é apagado.
     * Ele permanece no Firebase e entra
     * no histórico.
     */
    else if (
      novoStatus === "cancelado"
    ) {
      await updateDoc(
        doc(
          db,
          "pedidos",
          pedido.id
        ),
        {
          status: "cancelado",
          arquivado: true,
          canceladoEm: serverTimestamp(),
          statusAnterior: pedido.status,
        }
      );
    }

    /*
     * OUTROS STATUS
     */
    else {
      await updateDoc(
        doc(
          db,
          "pedidos",
          pedido.id
        ),
        {
          status: novoStatus,
        }
      );
    }

    /*
     * ATUALIZA O ESTADO DOS PEDIDOS
     */
    setPedidosAdmin(
      (anterior) =>
        anterior.map((item) => {
          if (
            item.id !== pedido.id
          ) {
            return item;
          }

          return {
            ...item,
            status: novoStatus,

            arquivado:
              novoStatus ===
              "cancelado"
                ? true
                : item.arquivado,

            canceladoEm:
              novoStatus ===
              "cancelado"
                ? new Date()
                : item.canceladoEm,

            estoqueBaixado:
              novoStatus ===
              "pagamento_aprovado"
                ? true
                : item.estoqueBaixado,
          };
        })
    );

    /*
     * ATUALIZA O ESTOQUE LOCAL
     * APÓS CONFIRMAR O PAGAMENTO
     */
    if (
      novoStatus ===
        "pagamento_aprovado" &&
      baixasPorProduto
    ) {
      setProdutosAdmin(
        (anterior) =>
          anterior.map(
            (produto) => {
              const baixas =
                baixasPorProduto[
                  produto.id
                ];

              if (!baixas) {
                return produto;
              }

              const novoEstoque = {
                ...(produto.estoque ||
                  {}),
              };

              Object.entries(
                baixas
              ).forEach(
                ([
                  tamanho,
                  quantidade,
                ]) => {
                  novoEstoque[
                    tamanho
                  ] =
                    Number(
                      novoEstoque[
                        tamanho
                      ] || 0
                    ) -
                    Number(
                      quantidade || 0
                    );
                }
              );

              return {
                ...produto,
                estoque:
                  novoEstoque,
              };
            }
          )
      );
    }

    /*
     * ATUALIZA O PEDIDO SELECIONADO
     */
    setPedidoSelecionado(
      (anterior) =>
        anterior?.id === pedido.id
          ? {
              ...anterior,
              status: novoStatus,

              arquivado:
                novoStatus ===
                "cancelado"
                  ? true
                  : anterior.arquivado,

              canceladoEm:
                novoStatus ===
                "cancelado"
                  ? new Date()
                  : anterior.canceladoEm,
            }
          : anterior
    );

    console.log(
      "Status do pedido atualizado:",
      pedido.numeroPedido,
      novoStatus
    );

    if (
      novoStatus ===
      "cancelado"
    ) {
      console.log(
        "Pedido enviado para o histórico:",
        pedido.numeroPedido
      );
    }
  } catch (error) {
    console.error(
      "Erro ao atualizar status do pedido:",
      error
    );

    setErroPedidos(
      error.message ||
        "Não foi possível atualizar o status do pedido."
    );
  } finally {
    setProcessandoPedido("");
  }
};

const avancarStatusPedido = async (pedido) => {
  const proximoStatus =
    obterProximoStatus(pedido);

  if (!proximoStatus) {
    return;
  }

  await alterarStatusPedido(
    pedido,
    proximoStatus
  );
};

const editarProduto = (produto) => {
  setProdutoEditando(produto);

  // Abre o formulário de edição
  setMostrarProdutos(false);
  setMostrarPedidos(false);
  setMostrarDashboard(false);
  setMostrarFormulario(true);

  setFormulario({
    nome: produto.nome || "",
    descricao: produto.descricao || "",
    categoria:
      produto.categoria ||
      produto.categorias ||
      "",
    preco: produto.preco ?? "",
    precoPromocional:
      produto.precoPromocional ?? "",
    tamanhos: produto.tamanhos || [],
    cores: produto.cores || [],
    tags: Array.isArray(produto.tags)
      ? produto.tags
      : produto.tags
        ? [produto.tags]
        : [],
    destaque: produto.destaque || false,
    oferta: produto.oferta || false,
    ativo: produto.ativo !== false,
  });

  setEstoque(produto.estoque || {});

  setImagemTeste(
    produto.imagens?.[0] || ""
  );

  setSucessoProduto("");
  setErroUpload("");

  // Leva até o formulário
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, 100);
};

const alternarStatusProduto = async (produto) => {
  const novoStatus = produto.ativo === false;

  setProcessandoProduto(produto.id);

  try {
    await updateDoc(
      doc(db, "produtos", produto.id),
      {
        ativo: novoStatus,
      }
    );

    setProdutosAdmin((anterior) =>
      anterior.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              ativo: novoStatus,
            }
          : item
      )
    );

    console.log(
      `Produto ${
        novoStatus
          ? "ativado"
          : "desativado"
      }:`,
      produto.id
    );
  } catch (error) {
    console.error(
      "Erro ao alterar status:",
      error
    );

    setErroUpload(
      error.message ||
        "Não foi possível alterar o status do produto."
    );
  } finally {
    setProcessandoProduto("");
  }
};

const excluirProduto = async (produto) => {
  const confirmar = window.confirm(
    `Tem certeza que deseja excluir o produto "${produto.nome}"?`
  );

  if (!confirmar) {
    return;
  }

  setProcessandoProduto(produto.id);

  try {
    await deleteDoc(
      doc(db, "produtos", produto.id)
    );

    setProdutosAdmin((anterior) =>
      anterior.filter(
        (item) => item.id !== produto.id
      )
    );

    console.log(
      "Produto excluído:",
      produto.id
    );
  } catch (error) {
    console.error(
      "Erro ao excluir produto:",
      error
    );

    setErroUpload(
      error.message ||
        "Não foi possível excluir o produto."
    );
  } finally {
    setProcessandoProduto("");
  }
};

  const testarUpload = async (event) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    setErroUpload("");
    setSucessoProduto("");
    setImagemTeste("");
    setCarregandoUpload(true);

    try {
      const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

      const formData = new FormData();

      formData.append("file", arquivo);
      formData.append(
        "upload_preset",
        UPLOAD_PRESET
      );

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message ||
            "Erro ao enviar a imagem."
        );
      }

      console.log(
        "Imagem enviada para o Cloudinary:",
        data
      );

      setImagemTeste(data.secure_url);
    } catch (error) {
      console.error(
        "Erro no upload:",
        error
      );

      setErroUpload(
        error.message ||
          "Não foi possível enviar a imagem."
      );
    } finally {
      setCarregandoUpload(false);
    }
  };

const atualizarProduto = async (event) => {
  event.preventDefault();

  if (!produtoEditando) {
    return;
  }

  setErroUpload("");
  setSucessoProduto("");
  setSalvandoEdicao(true);

  try {
    const produtoAtualizado = {
      nome: formulario.nome.trim(),

      descricao:
        formulario.descricao.trim(),

      categoria:
        formulario.categoria.trim(),

      preco: Number(formulario.preco),

      precoPromocional:
        formulario.precoPromocional
          ? Number(
              formulario.precoPromocional
            )
          : null,

      imagens: imagemTeste
        ? [imagemTeste]
        : produtoEditando.imagens || [],

      tamanhos:
        formulario.tamanhos,

      cores:
        formulario.cores,

      estoque,

      tags:
        formulario.tags,

      destaque:
        formulario.destaque,

      oferta:
        formulario.oferta,

      ativo:
        formulario.ativo,
    };

    await updateDoc(
      doc(
        db,
        "produtos",
        produtoEditando.id
      ),
      produtoAtualizado
    );

    setProdutosAdmin((anterior) =>
      anterior.map((produto) =>
        produto.id === produtoEditando.id
          ? {
              id: produtoEditando.id,
              ...produtoAtualizado,
            }
          : produto
      )
    );

    setSucessoProduto(
      "Produto atualizado com sucesso!"
    );

    setProdutoEditando(null);

    setFormulario({
      nome: "",
      descricao: "",
      categoria: "",
      preco: "",
      precoPromocional: "",
      tamanhos: [],
      cores: [],
      tags: [],
      destaque: false,
      oferta: false,
      ativo: true,
    });

    setEstoque({});
    setImagemTeste("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (error) {
    console.error(
      "Erro ao atualizar produto:",
      error
    );

    setErroUpload(
      error.message ||
        "Não foi possível atualizar o produto."
    );
  } finally {
    setSalvandoEdicao(false);
  }
};

  const cadastrarProduto = async (event) => {
    event.preventDefault();

    setErroUpload("");
    setSucessoProduto("");

    if (!imagemTeste) {
      setErroUpload(
        "Escolha uma foto para o produto antes de cadastrar."
      );
      return;
    }

    if (!formulario.nome.trim()) {
      setErroUpload(
        "Informe o nome do produto."
      );
      return;
    }

    if (!formulario.categoria.trim()) {
      setErroUpload(
        "Informe a categoria do produto."
      );
      return;
    }

    if (!formulario.preco) {
      setErroUpload(
        "Informe o preço do produto."
      );
      return;
    }

    if (formulario.tamanhos.length === 0) {
      setErroUpload(
        "Adicione pelo menos um tamanho."
      );
      return;
    }

    if (formulario.cores.length === 0) {
      setErroUpload(
        "Adicione pelo menos uma cor."
      );
      return;
    }

    setSalvandoProduto(true);

    try {
      const produto = {
        nome: formulario.nome.trim(),

        descricao: formulario.descricao.trim(),

        categoria: formulario.categoria.trim(),

        preco: Number(formulario.preco),

        precoPromocional:
          formulario.precoPromocional
            ? Number(
                formulario.precoPromocional
              )
            : null,

        imagens: [imagemTeste],

        tamanhos: formulario.tamanhos,

        cores: formulario.cores,

        estoque,

        tags: formulario.tags,

        destaque: formulario.destaque,

        oferta: formulario.oferta,

        ativo: formulario.ativo,
      };

      console.log(
        "PRODUTO QUE SERÁ SALVO NO FIREBASE:",
        produto
      );

      const documento = await addDoc(
        collection(db, "produtos"),
        produto
      );

      console.log(
        "Produto salvo no Firebase com ID:",
        documento.id
      );

      setSucessoProduto(
        `Produto cadastrado com sucesso! ID: ${documento.id}`
      );

      /*
       * Limpa o formulário depois do cadastro.
       */

      setFormulario({
        nome: "",
        descricao: "",
        categoria: "",
        preco: "",
        precoPromocional: "",
        tamanhos: [],
        cores: [],
        tags: [],
        destaque: false,
        oferta: false,
        ativo: true,
      });

      setEstoque({});
      setImagemTeste("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Erro ao cadastrar produto:",
        error
      );

      setErroUpload(
        error.message ||
          "Não foi possível cadastrar o produto no Firebase."
      );
    } finally {
      setSalvandoProduto(false);
    }
  };

  const pedidosPagos = pedidosAdmin.filter(
  (pedido) =>
    [
      "pagamento_aprovado",
      "preparando",
      "enviado",
      "entregue",
    ].includes(pedido.status)
);

const pedidosAguardandoPagamento =
  pedidosAdmin.filter(
    (pedido) =>
      pedido.status ===
      "aguardando_pagamento"
  );

const pedidosCancelados =
  pedidosAdmin.filter(
    (pedido) =>
      pedido.status ===
      "cancelado"
  );

  const pedidosAguardandoAcao =
  pedidosAdmin.filter((pedido) => {
    if (
      pedido.status ===
      "pagamento_aprovado"
    ) {
      return true;
    }

    if (
      pedido.status ===
      "preparando"
    ) {
      return true;
    }

    if (
      pedido.status ===
      "enviado"
    ) {
      return true;
    }

    if (
      pedido.status ===
        "aguardando_pagamento" &&
      pedido.pagamento ===
        "dinheiro"
    ) {
      return true;
    }

    return false;
  });

const totalVendas = pedidosPagos.reduce(
  (total, pedido) =>
    total + Number(pedido.total || 0),
  0
);

const totalItensVendidos =
  pedidosPagos.reduce(
    (total, pedido) => {
      const itens = Array.isArray(
        pedido.itens
      )
        ? pedido.itens
        : [];

      return (
        total +
        itens.reduce(
          (soma, item) =>
            soma +
            Number(
              item.quantidade || 0
            ),
          0
        )
      );
    },
    0
  );

  const hoje = new Date();

const vendasHoje = pedidosPagos.reduce(
  (total, pedido) => {
    const dataPedido =
      pedido.criadoEm?.toDate?.();

    if (!dataPedido) {
      return total;
    }

    const mesmoDia =
      dataPedido.getDate() ===
        hoje.getDate() &&
      dataPedido.getMonth() ===
        hoje.getMonth() &&
      dataPedido.getFullYear() ===
        hoje.getFullYear();

    return mesmoDia
      ? total + Number(pedido.total || 0)
      : total;
  },
  0
);

const vendasMes = pedidosPagos.reduce(
  (total, pedido) => {
    const dataPedido =
      pedido.criadoEm?.toDate?.();

    if (!dataPedido) {
      return total;
    }

    const mesmoMes =
      dataPedido.getMonth() ===
        hoje.getMonth() &&
      dataPedido.getFullYear() ===
        hoje.getFullYear();

    return mesmoMes
      ? total + Number(pedido.total || 0)
      : total;
  },
  0
);

const produtosSemEstoque =
  produtosAdmin.filter((produto) => {
    const estoqueProduto =
      produto.estoque || {};

    const quantidade =
      Object.values(
        estoqueProduto
      ).reduce(
        (soma, valor) =>
          soma + Number(valor || 0),
        0
      );

    return quantidade === 0;
  }).length;

const produtosEstoqueBaixo =
  produtosAdmin.filter((produto) => {
    const estoqueProduto =
      produto.estoque || {};

    const quantidade =
      Object.values(
        estoqueProduto
      ).reduce(
        (soma, valor) =>
          soma + Number(valor || 0),
        0
      );

    return quantidade > 0 &&
      quantidade <= 3;
  }).length;

const sairDoAdmin = async () => {
  try {
    await signOut(auth);

    window.location.href =
      "/login-admin";
  } catch (error) {
    console.error(
      "Erro ao sair do painel:",
      error
    );

    alert(
      "Não foi possível sair do painel. Tente novamente."
    );
  }
};

  return (
    <main className="admin">

      <header className="admin-header">
        <div>
          <span className="admin-label">
            DIVA VITORIA FASHION
          </span>

          <h1>
            Painel administrativo
          </h1>

          <p>
            Gerencie sua loja de forma simples e rápida.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            className="admin-voltar"
            type="button"
            onClick={() => {
              window.location.href =
                "/loja";
            }}
          >
            Voltar para a loja
          </button>

          <button
            type="button"
            onClick={sairDoAdmin}
            style={{
              minHeight: "44px",
              padding: "0 16px",
              border: "1px solid #e8e1dc",
              borderRadius: "10px",
              background: "#fcebea",
              color: "#a33",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* CARDS DO PAINEL */}

      <section className="admin-grid">
        <button
            className="admin-card"
            onClick={() => {
              setMostrarDashboard(false);
              setMostrarPedidos(false);
              setMostrarFormulario(false);
              abrirProdutos();
            }}
          >
          <span className="admin-card-icon">
            📦
          </span>

          <div>
            <h2>
              Produtos
            </h2>

            <p>
              Cadastre, edite e gerencie seus produtos.
            </p>
          </div>
        </button>

        <button
          className="admin-card"
          onClick={() => {
            setMostrarDashboard(false);
            setMostrarProdutos(false);
            setMostrarPedidos(false);
            setMostrarFormulario(true);

            setProdutoEditando(null);
            setSucessoProduto("");
            setErroUpload("");

            setFormulario({
              nome: "",
              descricao: "",
              categoria: "",
              preco: "",
              precoPromocional: "",
              tamanhos: [],
              cores: [],
              tags: [],
              destaque: false,
              oferta: false,
              ativo: true,
            });

            setEstoque({});
            setImagemTeste("");

            setTimeout(() => {
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              });
            }, 50);
          }}
        >
          <div className="admin-card-icon">➕</div>

          <div>
            <h3>Cadastrar produto</h3>
            <p>Adicionar novo produto</p>
          </div>
        </button>

        <button
            className="admin-card"
            onClick={abrirPedidos}
          >
            <span className="admin-card-icon">
              🛒
            </span>

            <div>
              <h2>
                Pedidos
              </h2>

              <p>
                Acompanhe e gerencie os pedidos da loja.
              </p>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  color:
                    pedidosAguardandoAcao.length > 0
                      ? "#8a6500"
                      : "#286b35",
                }}
              >
                {pedidosAguardandoAcao.length > 0
                  ? `⚠️ ${pedidosAguardandoAcao.length} aguardando ação`
                  : "✓ Tudo em dia"}
              </span>
            </div>
          </button>

        <button
          className="admin-card"
          onClick={() => {
            setMostrarDashboard(true);
            setMostrarProdutos(false);
            setMostrarPedidos(false);
            setMostrarFormulario(false);

            setTimeout(() => {
              dashboardRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 50);
          }}
        >
          <span className="admin-card-icon">
            📊
          </span>

          <div>
            <h2>
              Dashboard
            </h2>

            <p>
              Visualize informações importantes da loja.
            </p>
          </div>
        </button>



        <button className="admin-card">
          <span className="admin-card-icon">
            ⚙️
          </span>

          <div>
            <h2>
              Configurações
            </h2>

            <p>
              Configure informações da DIVA VITORIA FASHION.
            </p>
          </div>
        </button>

      </section>

{/* LISTA DE PRODUTOS */}

{mostrarProdutos && (
  <section className="admin-produtos">

    <div className="admin-produtos-header">

      <div>
        <span className="admin-label">
          CATÁLOGO
        </span>

        <h2>
          Produtos cadastrados
        </h2>

        <p>
          Produtos salvos no Firebase.
        </p>
      </div>

      <button
        type="button"
        className="admin-produtos-atualizar"
        onClick={abrirProdutos}
      >
        Atualizar produtos
      </button>

    </div>

    {carregandoProdutos ? (
      <p className="admin-produtos-carregando">
        Carregando produtos...
      </p>

    ) : produtosAdmin.length === 0 ? (

      <div className="admin-produtos-vazio">
        Nenhum produto cadastrado.
      </div>

    ) : (

      <div className="admin-produtos-grid">

        {produtosAdmin.map((produto) => (

          <article
            key={produto.id}
            className="admin-produto-card"
          >

            {produto.imagens?.[0] ? (

              <img
                className="admin-produto-imagem"
                src={produto.imagens[0]}
                alt={
                  produto.nome ||
                  "Produto"
                }
              />

            ) : (

              <div className="admin-produto-sem-imagem">
                Sem imagem
              </div>

            )}

            <div className="admin-produto-info">

              <h3>
                {produto.nome ||
                  "Produto sem nome"}
              </h3>

              <p className="admin-produto-categoria">
                {produto.categoria ||
                  produto.categorias ||
                  "Sem categoria"}
              </p>

              <strong className="admin-produto-preco">
                {produto.precoPromocional
                  ? `R$ ${Number(
                      produto.precoPromocional
                    )
                      .toFixed(2)
                      .replace(".", ",")}`
                  : `R$ ${Number(
                      produto.preco || 0
                    )
                      .toFixed(2)
                      .replace(".", ",")}`}
              </strong>

              {produto.precoPromocional && (
                <span className="admin-produto-preco-antigo">
                  R${" "}
                  {Number(
                    produto.preco || 0
                  )
                    .toFixed(2)
                    .replace(".", ",")}
                </span>
              )}

              {/* ESTOQUE DO PRODUTO */}

              <div
                style={{
                  marginTop: "18px",
                  paddingTop: "15px",
                  borderTop: "1px solid #eee",
                }}
              >
                <span
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "#555",
                  }}
                >
                  📦 Estoque
                </span>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {produto.tamanhos?.map((tamanho) => {
                    const quantidade =
                      Number(
                        produto.estoque?.[tamanho] || 0
                      );

                    return (
                      <span
                        key={tamanho}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "6px 9px",
                          borderRadius: "8px",
                          background:
                            quantidade === 0
                              ? "#fcebea"
                              : quantidade <= 3
                              ? "#fff4d6"
                              : "#edf8ef",
                          color:
                            quantidade === 0
                              ? "#a33"
                              : quantidade <= 3
                              ? "#8a6500"
                              : "#286b35",
                          fontSize: "0.78rem",
                          fontWeight: "700",
                        }}
                      >
                        {tamanho}

                        <span>
                          {quantidade === 0
                            ? "Esgotado"
                            : quantidade}
                        </span>
                      </span>
                    );
                  })}
                </div>

                <small
                  style={{
                    display: "block",
                    marginTop: "10px",
                    color: "#777",
                    fontSize: "0.78rem",
                  }}
                >
                  Total em estoque:{" "}
                  {Object.values(
                    produto.estoque || {}
                  ).reduce(
                    (total, valor) =>
                      total + Number(valor || 0),
                    0
                  )}{" "}
                  unidades
                </small>
              </div>

              <div className="admin-produto-footer">

                <span
                  className={`admin-produto-status ${
                    produto.ativo === false
                      ? "inativo"
                      : "ativo"
                  }`}
                >
                  {produto.ativo === false
                    ? "Inativo"
                    : "Ativo"}
                </span>

                <span className="admin-produto-id">
                  ID: {produto.id}
                </span>

              </div>

            </div>

            <div
              style={{
                marginTop: "15px",
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  editarProduto(produto)
                }
                disabled={
                  processandoProduto ===
                  produto.id
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "9px",
                  padding: "9px",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                ✏️ Editar
              </button>

              <button
                type="button"
                onClick={() =>
                  alternarStatusProduto(
                    produto
                  )
                }
                disabled={
                  processandoProduto ===
                  produto.id
                }
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "9px",
                  padding: "9px",
                  background: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {produto.ativo === false
                  ? "👁️ Ativar"
                  : "👁️ Desativar"}
              </button>

              <button
                type="button"
                onClick={() =>
                  excluirProduto(produto)
                }
                disabled={
                  processandoProduto ===
                  produto.id
                }
                style={{
                  gridColumn: "1 / -1",
                  border: "none",
                  borderRadius: "9px",
                  padding: "9px",
                  background: "#fcebea",
                  color: "#a33",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {processandoProduto ===
                produto.id
                  ? "Processando..."
                  : "🗑️ Excluir produto"}
              </button>
            </div>


          </article>

        ))}

      </div>

    )}

  </section>
)}

    {/* PEDIDOS */}

{mostrarPedidos && (
  <section className="admin-produtos">

    <div className="admin-produtos-header">

      <div>
        <span className="admin-label">
          VENDAS
        </span>

        <h2>
          Central de pedidos
        </h2>

        <p>
          Consulte, acompanhe e gerencie cada pedido da loja em um só lugar.
        </p>
      </div>

      <button
        type="button"
        className="admin-produtos-atualizar"
        onClick={abrirPedidos}
      >
        ↻ Atualizar pedidos
      </button>

    </div>

    <div className="admin-pedidos-abas">

      <button
        type="button"
        className={
          filtroPedidos === "ativos"
            ? "admin-pedido-aba ativa"
            : "admin-pedido-aba"
        }
        onClick={() => {
          setFiltroPedidos("ativos");
          setFiltroStatusPedido("todos");
          setPedidoSelecionado(null);
        }}
      >
        📦 Pedidos ativos
        <span>
          {pedidosAtivos.length}
        </span>
      </button>

      <button
        type="button"
        className={
          filtroPedidos === "historico"
            ? "admin-pedido-aba ativa"
            : "admin-pedido-aba"
        }
        onClick={() => {
          setFiltroPedidos("historico");
          setFiltroStatusPedido("todos");
          setPedidoSelecionado(null);
        }}
      >
        🕘 Histórico
        <span>
          {pedidosHistorico.length}
        </span>
      </button>

    </div>

    <div className="admin-pedidos-resumo">

      <div className="admin-pedidos-resumo-card">
        <span>📋 Exibidos</span>
        <strong>{pedidosFiltrados.length}</strong>
        <small>
          de {pedidosExibidos.length} nesta aba
        </small>
      </div>

      <div className="admin-pedidos-resumo-card">
        <span>⚠️ Aguardando ação</span>
        <strong>{pedidosAguardandoAcao.length}</strong>
        <small>
          pedidos que precisam de atendimento
        </small>
      </div>

      <div className="admin-pedidos-resumo-card">
        <span>💰 Valor exibido</span>
        <strong>
          R${" "}
          {pedidosFiltrados
            .reduce(
              (total, pedido) =>
                total + Number(pedido.total || 0),
              0
            )
            .toFixed(2)
            .replace(".", ",")}
        </strong>
        <small>
          soma dos pedidos filtrados
        </small>
      </div>

    </div>

    <div className="admin-pedidos-filtros">

      <div className="admin-pedidos-busca">
        <label htmlFor="buscaPedidosAdmin">
          Buscar pedido
        </label>

        <input
          id="buscaPedidosAdmin"
          type="search"
          value={buscaPedidos}
          onChange={(event) =>
            setBuscaPedidos(event.target.value)
          }
          placeholder="Número, cliente, WhatsApp ou e-mail"
        />
      </div>

      <div className="admin-pedidos-status-filtro">
        <label htmlFor="filtroStatusPedidoAdmin">
          Status
        </label>

        <select
          id="filtroStatusPedidoAdmin"
          value={filtroStatusPedido}
          onChange={(event) =>
            setFiltroStatusPedido(event.target.value)
          }
        >
          <option value="todos">
            Todos os status
          </option>

          {filtroPedidos === "ativos" ? (
            <>
              <option value="aguardando_pagamento">
                Aguardando pagamento
              </option>
              <option value="pagamento_aprovado">
                Pagamento aprovado
              </option>
              <option value="preparando">
                Preparando
              </option>
              <option value="enviado">
                Enviado
              </option>
              <option value="entregue">
                Entregue
              </option>
            </>
          ) : (
            <option value="cancelado">
              Cancelado
            </option>
          )}
        </select>
      </div>

      {(buscaPedidos || filtroStatusPedido !== "todos") && (
        <button
          type="button"
          className="admin-pedidos-limpar-filtros"
          onClick={() => {
            setBuscaPedidos("");
            setFiltroStatusPedido("todos");
          }}
        >
          Limpar filtros
        </button>
      )}

    </div>

    {erroPedidos && (
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          borderRadius: "12px",
          background: "#fcebea",
          color: "#a33",
        }}
      >
        <strong>
          Atenção:
        </strong>

        <br />

        {erroPedidos}
      </div>
    )}

    {carregandoPedidos ? (

      <p className="admin-produtos-carregando">
        Carregando pedidos...
      </p>

    ) : pedidosAdmin.length === 0 ? (

      <div className="admin-produtos-vazio">
        Nenhum pedido recebido ainda.
      </div>

    ) : pedidosFiltrados.length === 0 ? (

      <div className="admin-produtos-vazio">
        Nenhum pedido corresponde aos filtros atuais.
      </div>

    ) : (

      <div className="admin-pedidos-lista">

        {pedidosFiltrados.map((pedido) => {

          const dataPedido =
            formatarDataPedidoCompleta(
              pedido.criadoEm
            );

          const statusAtual =
            statusInfo[pedido.status] ||
            statusInfo.aguardando_pagamento;

          const quantidadeItens =
            Array.isArray(pedido.itens)
              ? pedido.itens.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.quantidade || 0
                    ),
                  0
                )
              : 0;

          const primeiroItem =
            Array.isArray(pedido.itens)
              ? pedido.itens[0]
              : null;

          return (
            <article
              key={pedido.id}
              className="admin-pedido-card"
            >

              <div className="admin-pedido-card-topo">

                <div>
                  <span className="admin-pedido-mini-label">
                    PEDIDO
                  </span>

                  <h3>
                    #{pedido.numeroPedido || pedido.id}
                  </h3>

                  <small>
                    {dataPedido}
                  </small>
                </div>

                <span
                  className="admin-pedido-status-badge"
                  style={{
                    background:
                      statusAtual.background,
                    color:
                      statusAtual.color,
                  }}
                >
                  {statusAtual.label}
                </span>

              </div>

              <div className="admin-pedido-card-dados">

                <div>
                  <span>Cliente</span>
                  <strong>
                    {pedido.cliente?.nome ||
                      "Não informado"}
                  </strong>
                </div>

                <div>
                  <span>WhatsApp</span>
                  <strong>
                    {pedido.cliente?.whatsapp ||
                      "Não informado"}
                  </strong>
                </div>

                <div>
                  <span>Pagamento</span>
                  <strong>
                    {obterPagamentoLabel(
                      pedido.pagamento
                    )}
                  </strong>
                </div>

                <div>
                  <span>Itens</span>
                  <strong>
                    {quantidadeItens}{" "}
                    {quantidadeItens === 1
                      ? "item"
                      : "itens"}
                  </strong>
                </div>

              </div>

              {primeiroItem && (
                <div className="admin-pedido-preview-item">

                  {primeiroItem.imagem ? (
                    <img
                      src={primeiroItem.imagem}
                      alt={primeiroItem.nome}
                    />
                  ) : (
                    <div className="admin-pedido-preview-sem-imagem">
                      🛍️
                    </div>
                  )}

                  <div>
                    <strong>
                      {primeiroItem.nome ||
                        "Produto"}
                    </strong>

                    <span>
                      {primeiroItem.cor ||
                        "Cor não informada"}{" "}
                      ·{" "}
                      {primeiroItem.tamanho ||
                        "Tamanho não informado"}{" "}
                      · Qtd.{" "}
                      {primeiroItem.quantidade ||
                        0}
                    </span>

                    {quantidadeItens > 1 && (
                      <small>
                        +{" "}
                        {quantidadeItens - 1}{" "}
                        outro
                        {quantidadeItens - 1 === 1
                          ? ""
                          : "s"}{" "}
                        item
                        {quantidadeItens - 1 === 1
                          ? ""
                          : "s"}
                      </small>
                    )}
                  </div>

                </div>
              )}

              <div className="admin-pedido-card-total">

                <div>
                  <span>
                    Total do pedido
                  </span>

                  <strong>
                    R${" "}
                    {Number(
                      pedido.total || 0
                    )
                      .toFixed(2)
                      .replace(".", ",")}
                  </strong>
                </div>

                <span className="admin-pedido-estoque">
                  {pedido.estoqueBaixado === true
                    ? "✓ Estoque baixado"
                    : pedido.status ===
                      "aguardando_pagamento"
                    ? "⏳ Estoque baixado após confirmação"
                    : "ℹ️ Estoque não baixado"}
                </span>

              </div>

              <div className="admin-pedido-acoes">

                <button
                  type="button"
                  className="admin-pedido-acao-principal"
                  onClick={() =>
                    setPedidoSelecionado(pedido)
                  }
                >
                  👁️ Ver detalhes
                </button>

                <button
                  type="button"
                  onClick={() =>
                    abrirWhatsAppPedido(pedido)
                  }
                  disabled={
                    !pedido.cliente?.whatsapp
                  }
                >
                  💬 WhatsApp
                </button>

                {pedido.status !== "entregue" &&
                  pedido.status !== "cancelado" && (
                  <button
                    type="button"
                    onClick={() =>
                      avancarStatusPedido(
                        pedido
                      )
                    }
                    disabled={
                      processandoPedido ===
                        pedido.id ||
                      (
                        pedido.status ===
                          "aguardando_pagamento" &&
                        pedido.pagamento !==
                          "dinheiro"
                      )
                    }
                  >
                    {processandoPedido ===
                    pedido.id
                      ? "Atualizando..."
                      : pedido.status ===
                        "aguardando_pagamento"
                      ? pedido.pagamento ===
                        "dinheiro"
                        ? "✅ Confirmar pagamento"
                        : "⏳ Aguardando Pix"
                      : pedido.status ===
                        "pagamento_aprovado"
                      ? "➡️ Preparar"
                      : pedido.status ===
                        "preparando"
                      ? "📦 Enviar"
                      : pedido.status ===
                        "enviado"
                      ? "✅ Entregar"
                      : "Avançar"}
                  </button>
                )}

                {pedido.status !== "entregue" &&
                  pedido.status !== "cancelado" && (
                  <button
                    type="button"
                    className="admin-pedido-acao-cancelar"
                    onClick={() => {
                      const confirmar =
                        window.confirm(
                          `Deseja realmente cancelar o pedido #${
                            pedido.numeroPedido ||
                            pedido.id
                          }?`
                        );

                      if (!confirmar) {
                        return;
                      }

                      alterarStatusPedido(
                        pedido,
                        "cancelado"
                      );
                    }}
                    disabled={
                      processandoPedido ===
                      pedido.id
                    }
                  >
                    🚫 Cancelar
                  </button>
                )}

              </div>

              {pedido.status === "cancelado" && (
                <div className="admin-pedido-historico">

                  <strong>
                    🕘 Pedido no histórico
                  </strong>

                  <p>
                    Cancelado em:{" "}
                    {formatarDataHistorico(
                      pedido.canceladoEm
                    )}
                  </p>

                  {obterDiasRestantesHistorico(
                    pedido
                  ) === null ? (
                    <p>
                      ⚠️ Data de cancelamento não
                      registrada.
                    </p>
                  ) : obterDiasRestantesHistorico(
                      pedido
                    ) > 0 ? (
                    <p>
                      🔒 Exclusão disponível em{" "}
                      <strong>
                        {obterDiasRestantesHistorico(
                          pedido
                        )}
                      </strong>{" "}
                      dia
                      {obterDiasRestantesHistorico(
                        pedido
                      ) === 1
                        ? ""
                        : "s"}.
                    </p>
                  ) : (
                    <p>
                      🗑️ Exclusão permanente disponível.
                    </p>
                  )}

                  <div className="admin-pedido-historico-acoes">

                    <button
                      type="button"
                      onClick={() =>
                        reativarPedido(pedido)
                      }
                      disabled={
                        processandoPedido ===
                        pedido.id
                      }
                    >
                      🔄 Reativar pedido
                    </button>

                    <button
                      type="button"
                      className="admin-pedido-excluir"
                      onClick={() =>
                        excluirPedidoPermanentemente(
                          pedido
                        )
                      }
                      disabled={
                        processandoPedido ===
                          pedido.id ||
                        !podeExcluirPermanentemente(
                          pedido
                        )
                      }
                    >
                      🗑️ Excluir permanentemente
                    </button>

                  </div>

                </div>
              )}

            </article>
          );
        })}

      </div>
    )}

  </section>
)}

{mostrarPedidos &&
  pedidoSelecionado && (
    <section
      className="admin-produtos"
      style={{
        marginTop: "25px",
      }}
    >

      <div className="admin-produtos-header">

        <div>
          <span className="admin-label">
            PEDIDO
          </span>

          <h2>
            #{pedidoSelecionado.numeroPedido ||
              pedidoSelecionado.id}
          </h2>

          <p>
            Ficha completa do pedido e ações de atendimento.
          </p>
        </div>

        <button
          type="button"
          className="admin-produtos-atualizar"
          onClick={() =>
            setPedidoSelecionado(null)
          }
        >
          ← Voltar para pedidos
        </button>

      </div>

      <div className="admin-pedido-detalhe-cabecalho">

        <div>
          <span>
            Status atual
          </span>

          <strong
            style={{
              background:
                (
                  statusInfo[
                    pedidoSelecionado.status
                  ] ||
                  statusInfo.aguardando_pagamento
                ).background,
              color:
                (
                  statusInfo[
                    pedidoSelecionado.status
                  ] ||
                  statusInfo.aguardando_pagamento
                ).color,
            }}
          >
            {
              (
                statusInfo[
                  pedidoSelecionado.status
                ] ||
                statusInfo.aguardando_pagamento
              ).label
            }
          </strong>
        </div>

        <div>
          <span>
            Pedido realizado
          </span>

          <strong>
            {formatarDataPedidoCompleta(
              pedidoSelecionado.criadoEm
            )}
          </strong>
        </div>

        <div>
          <span>
            Forma de pagamento
          </span>

          <strong>
            {obterPagamentoLabel(
              pedidoSelecionado.pagamento
            )}
          </strong>
        </div>

      </div>

      {pedidoSelecionado.status !== "cancelado" ? (
        <div className="admin-pedido-andamento">

          <div className="admin-pedido-andamento-titulo">
            <div>
              <span className="admin-label">
                ANDAMENTO
              </span>

              <h3>
                Acompanhe o ciclo do pedido
              </h3>
            </div>
          </div>

          <div className="admin-pedido-progresso">

            {[
              "aguardando_pagamento",
              "pagamento_aprovado",
              "preparando",
              "enviado",
              "entregue",
            ].map(
              (status, index) => {

                const statusAtualIndex =
                  obterIndiceStatusPedido(
                    pedidoSelecionado.status
                  );

                const ativo =
                  statusAtualIndex >= index;

                return (
                  <div
                    key={status}
                    className={
                      ativo
                        ? "admin-pedido-etapa concluida"
                        : "admin-pedido-etapa"
                    }
                  >
                    <div className="admin-pedido-etapa-ponto">
                      {ativo ? "✓" : index + 1}
                    </div>

                    <span>
                      {statusInfo[status].label}
                    </span>
                  </div>
                );
              }
            )}

          </div>

        </div>
      ) : (
        <div className="admin-pedido-cancelado-banner">

          <strong>
            🚫 Pedido cancelado e arquivado
          </strong>

          <span>
            Cancelado em{" "}
            {formatarDataHistorico(
              pedidoSelecionado.canceladoEm
            )}
          </span>

          <span>
            Status anterior:{" "}
            {statusInfo[
              pedidoSelecionado.statusAnterior
            ]?.label ||
              "Não registrado"}
          </span>

        </div>
      )}

      <div className="admin-pedido-atendimento">

        <div>
          <span className="admin-label">
            AÇÕES RÁPIDAS
          </span>

          <h3>
            Atendimento do cliente
          </h3>
        </div>

        <div className="admin-pedido-atendimento-acoes">

          <button
            type="button"
            onClick={() =>
              abrirWhatsAppPedido(
                pedidoSelecionado
              )
            }
            disabled={
              !pedidoSelecionado.cliente
                ?.whatsapp
            }
          >
            💬 Abrir WhatsApp
          </button>

          <button
            type="button"
            onClick={() =>
              abrirEmailPedido(
                pedidoSelecionado
              )
            }
            disabled={
              !pedidoSelecionado.cliente
                ?.email
            }
          >
            ✉️ Enviar e-mail
          </button>

          <button
            type="button"
            onClick={() =>
              copiarParaAreaDeTransferencia(
                pedidoSelecionado.numeroPedido ||
                pedidoSelecionado.id
              )
            }
          >
            📋 Copiar número
          </button>

          {pedidoSelecionado.status !==
            "entregue" &&
            pedidoSelecionado.status !==
              "cancelado" && (
            <>
              <button
                type="button"
                className="admin-pedido-acao-principal"
                onClick={() =>
                  avancarStatusPedido(
                    pedidoSelecionado
                  )
                }
                disabled={
                  processandoPedido ===
                    pedidoSelecionado.id ||
                  (
                    pedidoSelecionado.status ===
                      "aguardando_pagamento" &&
                    pedidoSelecionado.pagamento !==
                      "dinheiro"
                  )
                }
              >
                {processandoPedido ===
                pedidoSelecionado.id
                  ? "Atualizando..."
                  : pedidoSelecionado.status ===
                    "aguardando_pagamento"
                  ? pedidoSelecionado.pagamento ===
                    "dinheiro"
                    ? "✅ Confirmar pagamento"
                    : "⏳ Aguardando confirmação do Pix"
                  : pedidoSelecionado.status ===
                    "pagamento_aprovado"
                  ? "➡️ Iniciar preparação"
                  : pedidoSelecionado.status ===
                    "preparando"
                  ? "📦 Marcar como enviado"
                  : pedidoSelecionado.status ===
                    "enviado"
                  ? "✅ Marcar como entregue"
                  : "Avançar status"}
              </button>

              <button
                type="button"
                className="admin-pedido-acao-cancelar"
                onClick={() => {
                  const confirmar =
                    window.confirm(
                      `Deseja realmente cancelar o pedido #${
                        pedidoSelecionado.numeroPedido ||
                        pedidoSelecionado.id
                      }?`
                    );

                  if (!confirmar) {
                    return;
                  }

                  alterarStatusPedido(
                    pedidoSelecionado,
                    "cancelado"
                  );
                }}
                disabled={
                  processandoPedido ===
                  pedidoSelecionado.id
                }
              >
                🚫 Cancelar pedido
              </button>
            </>
          )}

          {pedidoSelecionado.status ===
            "cancelado" && (
            <>
              <button
                type="button"
                onClick={() =>
                  reativarPedido(
                    pedidoSelecionado
                  )
                }
                disabled={
                  processandoPedido ===
                  pedidoSelecionado.id
                }
              >
                🔄 Reativar pedido
              </button>

              <button
                type="button"
                className="admin-pedido-excluir"
                onClick={() =>
                  excluirPedidoPermanentemente(
                    pedidoSelecionado
                  )
                }
                disabled={
                  processandoPedido ===
                    pedidoSelecionado.id ||
                  !podeExcluirPermanentemente(
                    pedidoSelecionado
                  )
                }
              >
                🗑️ Excluir permanentemente
              </button>
            </>
          )}

        </div>

      </div>

      <div className="admin-pedido-detalhe-grid">

        <div className="admin-pedido-info-box">

          <h3>
            👤 Cliente
          </h3>

          <p>
            <strong>Nome:</strong>{" "}
            {pedidoSelecionado.cliente?.nome ||
              "Não informado"}
          </p>

          <p>
            <strong>WhatsApp:</strong>{" "}
            {pedidoSelecionado.cliente?.whatsapp ||
              "Não informado"}
          </p>

          <p>
            <strong>E-mail:</strong>{" "}
            {pedidoSelecionado.cliente?.email ||
              "Não informado"}
          </p>

        </div>

        <div className="admin-pedido-info-box">

          <h3>
            💳 Pagamento
          </h3>

          <p>
            <strong>Forma:</strong>{" "}
            {obterPagamentoLabel(
              pedidoSelecionado.pagamento
            )}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {
              (
                statusInfo[
                  pedidoSelecionado.status
                ] ||
                statusInfo.aguardando_pagamento
              ).label
            }
          </p>

          <p>
            <strong>Estoque:</strong>{" "}
            {pedidoSelecionado.estoqueBaixado ===
            true
              ? "Baixado"
              : "Ainda não baixado"}
          </p>

          <p>
            <strong>Subtotal:</strong>{" "}
            R${" "}
            {Number(
              pedidoSelecionado.subtotal || 0
            )
              .toFixed(2)
              .replace(".", ",")}
          </p>

          <p>
            <strong>Total:</strong>{" "}
            R${" "}
            {Number(
              pedidoSelecionado.total || 0
            )
              .toFixed(2)
              .replace(".", ",")}
          </p>

        </div>

        <div className="admin-pedido-info-box">

          <h3>
            📍 Entrega
          </h3>

          <p>
            <strong>Tipo:</strong>{" "}
            {pedidoSelecionado.entrega?.forma ===
            "retirada"
              ? "Retirada"
              : "Entrega"}
          </p>

          {pedidoSelecionado.entrega?.forma ===
            "entrega" && (
            <>
              <p>
                <strong>CEP:</strong>{" "}
                {pedidoSelecionado.entrega?.cep ||
                  "Não informado"}
              </p>

              <p>
                <strong>Endereço:</strong>{" "}
                {pedidoSelecionado.entrega?.rua ||
                  "Não informado"}
                ,{" "}
                {pedidoSelecionado.entrega?.numero ||
                  "S/N"}
              </p>

              {pedidoSelecionado.entrega
                ?.complemento && (
                <p>
                  <strong>Complemento:</strong>{" "}
                  {
                    pedidoSelecionado.entrega
                      .complemento
                  }
                </p>
              )}

              <p>
                <strong>Bairro:</strong>{" "}
                {pedidoSelecionado.entrega?.bairro ||
                  "Não informado"}
              </p>

              <p>
                <strong>Cidade:</strong>{" "}
                {pedidoSelecionado.entrega?.cidade ||
                  "Não informado"}{" "}
                -{" "}
                {pedidoSelecionado.entrega?.estado ||
                  ""}
              </p>

              <button
                type="button"
                className="admin-pedido-copiar-endereco"
                onClick={() =>
                  copiarParaAreaDeTransferencia(
                    [
                      pedidoSelecionado.entrega?.rua,
                      pedidoSelecionado.entrega?.numero,
                      pedidoSelecionado.entrega?.complemento,
                      pedidoSelecionado.entrega?.bairro,
                      pedidoSelecionado.entrega?.cidade,
                      pedidoSelecionado.entrega?.estado,
                      pedidoSelecionado.entrega?.cep,
                    ]
                      .filter(Boolean)
                      .join(", ")
                  )
                }
              >
                📋 Copiar endereço
              </button>
            </>
          )}

        </div>

      </div>

      <div className="admin-pedido-produtos-detalhe">

        <div className="admin-pedido-andamento-titulo">
          <div>
            <span className="admin-label">
              ITENS
            </span>

            <h3>
              Produtos do pedido
            </h3>
          </div>

          <strong>
            {Array.isArray(
              pedidoSelecionado.itens
            )
              ? pedidoSelecionado.itens.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.quantidade || 0
                    ),
                  0
                )
              : 0}{" "}
            {(
              Array.isArray(
                pedidoSelecionado.itens
              )
                ? pedidoSelecionado.itens.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.quantidade || 0
                      ),
                    0
                  )
                : 0
            ) === 1
              ? "unidade"
              : "unidades"}
          </strong>
        </div>

        <div className="admin-pedido-itens-lista">

          {pedidoSelecionado.itens?.map(
            (item, index) => (
              <div
                key={`${item.id || item.produtoId || "item"}-${index}`}
                className="admin-pedido-item-detalhe"
              >

                {item.imagem ? (
                  <img
                    src={item.imagem}
                    alt={item.nome}
                  />
                ) : (
                  <div className="admin-pedido-item-sem-imagem">
                    🛍️
                  </div>
                )}

                <div className="admin-pedido-item-conteudo">

                  <strong>
                    {item.nome ||
                      "Produto"}
                  </strong>

                  <span>
                    Cor:{" "}
                    {item.cor ||
                      "Não informada"}
                  </span>

                  <span>
                    Tamanho:{" "}
                    {item.tamanho ||
                      "Não informado"}
                  </span>

                  <span>
                    Quantidade:{" "}
                    {item.quantidade || 0}
                  </span>

                  <span>
                    Preço unitário:{" "}
                    R${" "}
                    {Number(
                      item.preco || 0
                    )
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>

                </div>

                <strong className="admin-pedido-item-subtotal">
                  R${" "}
                  {Number(
                    item.subtotal ??
                    Number(item.preco || 0) *
                      Number(item.quantidade || 0)
                  )
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>

              </div>
            )
          )}

        </div>

        <div className="admin-pedido-totais">

          <div>
            <span>
              Subtotal
            </span>

            <strong>
              R${" "}
              {Number(
                pedidoSelecionado.subtotal || 0
              )
                .toFixed(2)
                .replace(".", ",")}
            </strong>
          </div>

          <div className="admin-pedido-total-final">
            <span>
              Total
            </span>

            <strong>
              R${" "}
              {Number(
                pedidoSelecionado.total || 0
              )
                .toFixed(2)
                .replace(".", ",")}
            </strong>
          </div>

        </div>

      </div>

    </section>
  )}

      {/* DASHBOARD */}

{mostrarDashboard && (
  <section
    ref={dashboardRef}
    className="admin-produtos"
    style={{
      marginTop: "30px",
    }}
  >
    <div className="admin-produtos-header">
      <div>
        <span className="admin-label">
          VISÃO GERAL
        </span>

        <h2>
          Dashboard
        </h2>

        <p>
          Informações atuais dos produtos da loja.
        </p>
      </div>

      <button
          type="button"
          className="admin-produtos-atualizar"
          onClick={async () => {
            await Promise.all([
              carregarProdutos(),
              carregarPedidos(),
            ]);
          }}
        >
          Atualizar dados
        </button>
      </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "18px",
      }}
    >
      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          📦 Produtos
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {produtosAdmin.length}
        </strong>
      </div>

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          🟢 Produtos ativos
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {
            produtosAdmin.filter(
              (produto) =>
                produto.ativo !== false
            ).length
          }
        </strong>
      </div>

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          🔴 Produtos inativos
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {
            produtosAdmin.filter(
              (produto) =>
                produto.ativo === false
            ).length
          }
        </strong>
      </div>

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          🏷️ Em oferta
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {
            produtosAdmin.filter(
              (produto) =>
                produto.oferta === true
            ).length
          }
        </strong>
      </div>

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          ⭐ Em destaque
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {
            produtosAdmin.filter(
              (produto) =>
                produto.destaque === true
            ).length
          }
        </strong>
      </div>

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          📦 Estoque
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {produtosAdmin.reduce(
            (total, produto) => {
              const estoqueProduto =
                produto.estoque || {};

              const quantidade =
                Object.values(
                  estoqueProduto
                ).reduce(
                  (soma, valor) =>
                    soma + Number(valor || 0),
                  0
                );

              return total + quantidade;
            },
            0
          )}
        </strong>

        <small>
          unidades disponíveis
        </small>
      </div>
            <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          🛍️ Itens vendidos
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {totalItensVendidos}
        </strong>

        <small>
          unidades vendidas
        </small>
      </div>
      {/* PEDIDOS */}

      <div
  style={{
    padding: "22px",
    border: "1px solid #e8e1dc",
    borderRadius: "16px",
    background: "#fff",
  }}
>
  <span>
    🛒 Pedidos
  </span>

  <strong
    style={{
      display: "block",
      marginTop: "10px",
      fontSize: "2rem",
    }}
  >
    {pedidosAdmin.length}
  </strong>

  <small>
    pedidos recebidos
  </small>

  <div
    style={{
      marginTop: "10px",
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: "20px",
      background:
        pedidosAguardandoAcao.length > 0
          ? "#fff4d6"
          : "#edf8ef",
      color:
        pedidosAguardandoAcao.length > 0
          ? "#8a6500"
          : "#286b35",
      fontSize: "0.78rem",
      fontWeight: "700",
    }}
  >
    {pedidosAguardandoAcao.length > 0
      ? `⚠️ ${pedidosAguardandoAcao.length} aguardando ação`
      : "✓ Nenhuma ação pendente"}
  </div>
</div>


      {/* PAGAMENTOS CONFIRMADOS */}

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          💳 Pagamentos confirmados
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {pedidosPagos.length}
        </strong>

        <small>
          pedidos pagos
        </small>
      </div>


      {/* AGUARDANDO PAGAMENTO */}

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          ⏳ Aguardando pagamento
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {pedidosAguardandoPagamento.length}
        </strong>

        <small>
          pedidos pendentes
        </small>
      </div>


      {/* VENDAS */}

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          💰 Vendas
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          R${" "}
          {totalVendas
            .toFixed(2)
            .replace(".", ",")}
        </strong>

        <small>
          faturamento confirmado
        </small>
      </div>


      {/* CANCELADOS */}

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          🚫 Cancelados
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {pedidosCancelados.length}
        </strong>

        <small>
          pedidos cancelados
        </small>
      </div>
            {/* VENDAS DE HOJE */}

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          📅 Vendas hoje
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          R${" "}
          {vendasHoje
            .toFixed(2)
            .replace(".", ",")}
        </strong>

        <small>
          faturamento de hoje
        </small>
      </div>


      {/* VENDAS DO MÊS */}

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          📆 Vendas do mês
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          R${" "}
          {vendasMes
            .toFixed(2)
            .replace(".", ",")}
        </strong>

        <small>
          faturamento deste mês
        </small>
      </div>


      {/* SEM ESTOQUE */}

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          ⚠️ Sem estoque
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {produtosSemEstoque}
        </strong>

        <small>
          produtos esgotados
        </small>
      </div>


      {/* ESTOQUE BAIXO */}

      <div
        style={{
          padding: "22px",
          border: "1px solid #e8e1dc",
          borderRadius: "16px",
          background: "#fff",
        }}
      >
        <span>
          🔔 Estoque baixo
        </span>

        <strong
          style={{
            display: "block",
            marginTop: "10px",
            fontSize: "2rem",
          }}
        >
          {produtosEstoqueBaixo}
        </strong>

        <small>
          produtos com até 3 unidades
        </small>
      </div>
    </div>
    {/* ÚLTIMOS PEDIDOS */}

<div
  style={{
    marginTop: "30px",
    padding: "25px",
    border: "1px solid #e8e1dc",
    borderRadius: "18px",
    background: "#fff",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      marginBottom: "20px",
      flexWrap: "wrap",
    }}
  >
    <div>
      <span className="admin-label">
        VENDAS
      </span>

      <h3
        style={{
          margin: "5px 0 0",
        }}
      >
        Últimos pedidos
      </h3>

      <p
        style={{
          margin: "5px 0 0",
          color: "#777",
        }}
      >
        Os 5 pedidos mais recentes da loja.
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        setMostrarDashboard(false);
        setMostrarProdutos(false);
        setMostrarFormulario(false);
        setMostrarPedidos(true);
        setPedidoSelecionado(null);
        carregarPedidos();
      }}
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "10px 14px",
        background: "white",
        cursor: "pointer",
        fontWeight: "600",
      }}
    >
      Ver todos os pedidos
    </button>
  </div>

  {pedidosAdmin.length === 0 ? (
    <div
      style={{
        padding: "25px",
        borderRadius: "12px",
        background: "#f7f5f3",
        textAlign: "center",
        color: "#777",
      }}
    >
      Nenhum pedido recebido ainda.
    </div>
  ) : (
    <div
      style={{
        display: "grid",
        gap: "12px",
      }}
    >
      {pedidosAdmin
        .slice(0, 5)
        .map((pedido) => {
          const statusAtual =
            statusInfo[pedido.status] ||
            statusInfo.aguardando_pagamento;

          const quantidadeItens =
            Array.isArray(pedido.itens)
              ? pedido.itens.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.quantidade || 0
                    ),
                  0
                )
              : 0;

          const dataPedido =
            pedido.criadoEm?.toDate
              ? pedido.criadoEm
                  .toDate()
                  .toLocaleString("pt-BR")
              : "Data não disponível";

          return (
            <div
              key={pedido.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr auto auto",
                alignItems: "center",
                gap: "20px",
                padding: "16px",
                border:
                  "1px solid #eee",
                borderRadius: "14px",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  #{pedido.numeroPedido}
                </strong>

                <span
                  style={{
                    display: "block",
                    color: "#555",
                    fontSize: "0.9rem",
                  }}
                >
                  {pedido.cliente?.nome ||
                    "Cliente não informado"}
                </span>

                <small
                  style={{
                    display: "block",
                    marginTop: "4px",
                    color: "#999",
                  }}
                >
                  {dataPedido} ·{" "}
                  {quantidadeItens}{" "}
                  {quantidadeItens === 1
                    ? "item"
                    : "itens"}
                </small>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 9px",
                    borderRadius: "20px",
                    background:
                      statusAtual.background,
                    color:
                      statusAtual.color,
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    whiteSpace: "nowrap",
                    marginBottom: "6px",
                  }}
                >
                  {statusAtual.label}
                </span>

                <strong
                  style={{
                    display: "block",
                  }}
                >
                  R${" "}
                  {Number(
                    pedido.total || 0
                  )
                    .toFixed(2)
                    .replace(".", ",")}
                </strong>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMostrarDashboard(false);
                  setMostrarProdutos(false);
                  setMostrarFormulario(false);
                  setMostrarPedidos(true);
                  setPedidoSelecionado(
                    pedido
                  );
                }}
                style={{
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 13px",
                  background: "#222",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Ver
              </button>
            </div>
          );
        })}
    </div>
  )}
</div>
  </section>
)}

      {/* RESUMO */}

      <section className="admin-resumo">

        <div className="admin-resumo-item">
          <span>
            Produtos cadastrados
          </span>

          <strong>
            {produtosAdmin.length}
          </strong>
        </div>

        <div className="admin-resumo-item">
          <span>
            Pedidos
          </span>

          <strong>
            {pedidosAdmin.length}
          </strong>
        </div>

        <div className="admin-resumo-item">
          <span>
            Vendas confirmadas
          </span>

          <strong>
            R${" "}
            {totalVendas
              .toFixed(2)
              .replace(".", ",")}
          </strong>
        </div>

      </section>

      {/* FORMULÁRIO */}

      {mostrarFormulario && (
      <section
        style={{
          maxWidth: "1200px",
          margin: "30px auto 0",
          padding: "30px",
          border: "1px solid #e8e1dc",
          borderRadius: "18px",
          background: "white",
        }}
      >

        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <span className="admin-label">
            PRODUTOS
          </span>

          <h2>
  {produtoEditando
    ? "Editar produto"
    : "Cadastrar produto"}
</h2>

          <p
            style={{
              margin: 0,
              color: "#777",
            }}
          >
            {produtoEditando
  ? "Altere as informações do produto e salve as mudanças."
  : "Cadastre uma nova peça da DIVA VITORIA FASHION."}
          </p>
        </div>

        {sucessoProduto && (
          <div
            style={{
              marginBottom: "25px",
              padding: "16px",
              borderRadius: "12px",
              background: "#edf8ef",
              color: "#286b35",
              lineHeight: "1.5",
            }}
          >
            <strong>
              ✓ {sucessoProduto}
            </strong>

            <p
              style={{
                margin:
                  "8px 0 0",
              }}
            >
              O produto já foi salvo na coleção
              <strong> produtos </strong>
              do Firebase.
            </p>
          </div>
        )}

        {erroUpload && (
          <div
            style={{
              marginBottom: "25px",
              padding: "16px",
              borderRadius: "12px",
              background: "#fcebea",
              color: "#a33",
              lineHeight: "1.5",
            }}
          >
            <strong>
              Atenção:
            </strong>

            <br />

            {erroUpload}
          </div>
        )}

          <form
            onSubmit={
              produtoEditando
                ? atualizarProduto
                : cadastrarProduto
            }
          >

          {/* IMAGEM */}

          <div
            style={{
              marginBottom: "30px",
            }}
          >
            <h3>
              📸 Foto do produto
            </h3>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "48px",
                padding: "0 20px",
                borderRadius: "12px",
                background: "#222",
                color: "white",
                fontSize: "0.9rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {carregandoUpload
                ? "Enviando imagem..."
                : "Escolher foto"}

              <input
                type="file"
                accept="image/*"
                onChange={testarUpload}
                disabled={
                  carregandoUpload ||
                  salvandoProduto
                }
                style={{
                  display: "none",
                }}
              />
            </label>

            {imagemTeste && (
              <div
                style={{
                  marginTop: "20px",
                }}
              >
                <img
                  src={imagemTeste}
                  alt="Produto"
                  style={{
                    width: "180px",
                    height: "220px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    border:
                      "1px solid #e8e1dc",
                  }}
                />
              </div>
            )}
          </div>

          {/* INFORMAÇÕES */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >

            <div>
              <label>
                Nome do produto
              </label>

              <input
                type="text"
                value={formulario.nome}
                onChange={(event) =>
                  alterarCampo(
                    "nome",
                    event.target.value
                  )
                }
                placeholder="Ex: Vestido Midi Elegance"
                required
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div>
              <label>
                Categoria
              </label>

              <input
                type="text"
                value={
                  formulario.categoria
                }
                onChange={(event) =>
                  alterarCampo(
                    "categoria",
                    event.target.value
                  )
                }
                placeholder="Ex: Vestidos"
                required
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div>
              <label>
                Preço
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={formulario.preco}
                onChange={(event) =>
                  alterarCampo(
                    "preco",
                    event.target.value
                  )
                }
                placeholder="189.90"
                required
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div>
              <label>
                Preço promocional
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={
                  formulario.precoPromocional
                }
                onChange={(event) =>
                  alterarCampo(
                    "precoPromocional",
                    event.target.value
                  )
                }
                placeholder="149.90"
                style={{
                  width: "100%",
                  marginTop: "8px",
                  padding: "13px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "10px",
                }}
              />
            </div>

          </div>

          {/* DESCRIÇÃO */}

          <div
            style={{
              marginTop: "20px",
            }}
          >
            <label>
              Descrição
            </label>

            <textarea
              value={
                formulario.descricao
              }
              onChange={(event) =>
                alterarCampo(
                  "descricao",
                  event.target.value
                )
              }
              placeholder="Descreva o produto..."
              rows="4"
              required
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "13px",
                border:
                  "1px solid #ddd",
                borderRadius: "10px",
                resize: "vertical",
              }}
            />
          </div>

          {/* TAMANHOS */}

          <div
            style={{
              marginTop: "30px",
            }}
          >
            <h3>
              📏 Tamanhos
            </h3>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                value={novoTamanho}
                onChange={(event) =>
                  setNovoTamanho(
                    event.target.value
                  )
                }
                placeholder="Ex: P"
                style={{
                  padding: "12px",
                  border:
                    "1px solid #ddd",
                  borderRadius: "10px",
                  width: "150px",
                }}
              />

              <button
                type="button"
                onClick={
                  adicionarTamanho
                }
                style={{
                  padding:
                    "12px 18px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#222",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Adicionar tamanho
              </button>
            </div>

            {formulario.tamanhos.length >
              0 && (
              <div
                style={{
                  marginTop: "18px",
                  display: "grid",
                  gap: "12px",
                }}
              >
                {formulario.tamanhos.map(
                  (tamanho) => (
                    <div
                      key={tamanho}
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "12px",
                        flexWrap:
                          "wrap",
                        padding: "12px",
                        background:
                          "#f7f5f3",
                        borderRadius:
                          "10px",
                      }}
                    >
                      <strong>
                        {tamanho}
                      </strong>

                      <input
                        type="number"
                        min="0"
                        value={
                          estoque[
                            tamanho
                          ] ?? 0
                        }
                        onChange={(
                          event
                        ) =>
                          alterarEstoque(
                            tamanho,
                            event.target
                              .value
                          )
                        }
                        placeholder="Estoque"
                        style={{
                          padding:
                            "9px",
                          border:
                            "1px solid #ddd",
                          borderRadius:
                            "8px",
                          width:
                            "120px",
                        }}
                      />

                      <span
                        style={{
                          color:
                            "#777",
                          fontSize:
                            "0.85rem",
                        }}
                      >
                        unidades
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removerTamanho(
                            tamanho
                          )
                        }
                        style={{
                          marginLeft:
                            "auto",
                          border:
                            "none",
                          background:
                            "transparent",
                          color:
                            "#a33",
                          cursor:
                            "pointer",
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* CORES */}

          <div
            style={{
              marginTop: "30px",
            }}
          >
            <h3>
              🎨 Cores
            </h3>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                value={
                  novaCorNome
                }
                onChange={(event) =>
                  setNovaCorNome(
                    event.target.value
                  )
                }
                placeholder="Ex: Preto"
                style={{
                  padding: "12px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  width: "150px",
                }}
              />

              <input
                type="color"
                value={
                  novaCorCodigo
                }
                onChange={(event) =>
                  setNovaCorCodigo(
                    event.target.value
                  )
                }
                style={{
                  width: "55px",
                  height: "45px",
                  padding: "3px",
                  border:
                    "1px solid #ddd",
                  borderRadius:
                    "10px",
                  cursor:
                    "pointer",
                }}
              />

              <button
                type="button"
                onClick={
                  adicionarCor
                }
                style={{
                  padding:
                    "12px 18px",
                  border: "none",
                  borderRadius:
                    "10px",
                  background:
                    "#222",
                  color: "white",
                  cursor:
                    "pointer",
                }}
              >
                Adicionar cor
              </button>
            </div>

            {formulario.cores.length >
              0 && (
              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {formulario.cores.map(
                  (cor) => (
                    <div
                      key={cor.nome}
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "8px",
                        padding:
                          "9px 12px",
                        background:
                          "#f7f5f3",
                        borderRadius:
                          "10px",
                      }}
                    >
                      <span
                        style={{
                          width:
                            "22px",
                          height:
                            "22px",
                          borderRadius:
                            "50%",
                          background:
                            cor.codigo,
                          border:
                            "1px solid #ccc",
                        }}
                      />

                      <span>
                        {cor.nome}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removerCor(
                            cor.nome
                          )
                        }
                        style={{
                          border:
                            "none",
                          background:
                            "transparent",
                          color:
                            "#a33",
                          cursor:
                            "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* TAGS */}

          <div
            style={{
              marginTop: "30px",
            }}
          >
            <h3>
              🏷️ Tags
            </h3>

            <p
              style={{
                margin: "0 0 15px",
                color: "#777",
                fontSize: "0.9rem",
              }}
            >
              Adicione etiquetas para organizar e destacar o produto.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                id="novaTag"
                placeholder="Ex: Novidade"
                style={{
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  width: "200px",
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") {
                    return;
                  }

                  event.preventDefault();

                  const tag = event.target.value
                    .trim()
                    .toLowerCase();

                  if (!tag) {
                    return;
                  }

                  if (formulario.tags.includes(tag)) {
                    event.target.value = "";
                    return;
                  }

                  setFormulario((anterior) => ({
                    ...anterior,
                    tags: [tag],
                  }));

                  event.target.value = "";
                }}
              />

              <button
                type="button"
                onClick={() => {
                  const input =
                    document.getElementById(
                      "novaTag"
                    );

                  const tag = input.value
                    .trim()
                    .toLowerCase();

                  if (!tag) {
                    return;
                  }

                  if (formulario.tags.includes(tag)) {
                    input.value = "";
                    return;
                  }

                  setFormulario((anterior) => ({
                    ...anterior,
                    tags: [tag],
                  }));

                  input.value = "";
                }}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#222",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Adicionar tag
              </button>
            </div>

            {formulario.tags.length > 0 && (
              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {formulario.tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "9px 12px",
                      background: "#f7f5f3",
                      borderRadius: "20px",
                      border: "1px solid #e8e1dc",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: "600",
                      }}
                    >
                      #{tag}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setFormulario((anterior) => ({
                          ...anterior,
                          tags: anterior.tags.filter(
                            (item) => item !== tag
                          ),
                        }));
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#a33",
                        cursor: "pointer",
                        fontSize: "1rem",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OPÇÕES */}

          <div
            style={{
              marginTop: "30px",
              display: "flex",
              flexDirection:
                "column",
              gap: "14px",
            }}
          >
            <label>
              <input
                type="checkbox"
                checked={
                  formulario.destaque
                }
                onChange={(event) =>
                  alterarCampo(
                    "destaque",
                    event.target
                      .checked
                  )
                }
              />{" "}
              Produto em destaque
            </label>

            <label>
              <input
                type="checkbox"
                checked={
                  formulario.oferta
                }
                onChange={(event) =>
                  alterarCampo(
                    "oferta",
                    event.target
                      .checked
                  )
                }
              />{" "}
              Produto em oferta
            </label>

            <label>
              <input
                type="checkbox"
                checked={
                  formulario.ativo
                }
                onChange={(event) =>
                  alterarCampo(
                    "ativo",
                    event.target
                      .checked
                  )
                }
              />{" "}
              Produto ativo
            </label>
          </div>

          {/* BOTÃO */}

          <button
            type="submit"
            disabled={salvandoProduto || salvandoEdicao}
            style={{
              width: "100%",
              marginTop: "35px",
              minHeight: "54px",
              border: "none",
              borderRadius: "12px",
              background:
                salvandoProduto
                  ? "#888"
                  : "#222",
              color: "white",
              fontSize: "1rem",
              fontWeight: "700",
              cursor:
                salvandoProduto
                  ? "not-allowed"
                  : "pointer",
            }}
          >
      
            {produtoEditando
              ? salvandoEdicao
                ? "Salvando alterações..."
                : "Salvar alterações"
              : salvandoProduto
                ? "Salvando produto..."
                : "Cadastrar produto"}
          </button>

        </form>

      </section>
)}
    </main>
  );
}

export default Admin;