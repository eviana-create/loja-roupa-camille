import { useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "./Admin.css";

const CLOUD_NAME = "xs7pnfwj";
const UPLOAD_PRESET = "diva-vitoria-produtos";

function Admin() {
  const [imagemTeste, setImagemTeste] = useState("");
  const [carregandoUpload, setCarregandoUpload] = useState(false);
  const [erroUpload, setErroUpload] = useState("");

  const [salvandoProduto, setSalvandoProduto] = useState(false);
  const [produtosAdmin, setProdutosAdmin] = useState([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);
  const [mostrarProdutos, setMostrarProdutos] = useState(false);
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

const abrirProdutos = async () => {
  setMostrarProdutos(true);
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
  } catch (error) {
    console.error(
      "Erro ao carregar produtos:",
      error
    );

    setErroUpload(
      error.message ||
        "Não foi possível carregar os produtos."
    );
  } finally {
    setCarregandoProdutos(false);
  }
};

const editarProduto = (produto) => {
  setProdutoEditando(produto);

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

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
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

        <button
          className="admin-voltar"
          onClick={() => {
            window.location.href = "/loja";
          }}
        >
          Voltar para a loja
        </button>
      </header>

      {/* CARDS DO PAINEL */}

      <section className="admin-grid">
        <button
          className="admin-card"
          onClick={abrirProdutos}
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

        <button className="admin-card">
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
          </div>
        </button>

        <button className="admin-card">
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

      {/* RESUMO */}

      <section className="admin-resumo">

        <div className="admin-resumo-item">
          <span>
            Produtos cadastrados
          </span>

          <strong>
            —
          </strong>
        </div>

        <div className="admin-resumo-item">
          <span>
            Pedidos
          </span>

          <strong>
            —
          </strong>
        </div>

        <div className="admin-resumo-item">
          <span>
            Vendas
          </span>

          <strong>
            R$ 0,00
          </strong>
        </div>

      </section>

      {/* FORMULÁRIO */}

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
                    tags: [
                      ...anterior.tags,
                      tag,
                    ],
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
                    tags: [
                      ...anterior.tags,
                      tag,
                    ],
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

    </main>
  );
}

export default Admin;