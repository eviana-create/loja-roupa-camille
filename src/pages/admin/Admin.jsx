import "./Admin.css";

function Admin() {
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

      <section className="admin-grid">

        <button className="admin-card">
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

    </main>
  );
}

export default Admin;