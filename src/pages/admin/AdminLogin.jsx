import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  const entrar = async (event) => {
    event.preventDefault();

    setErro("");

    if (!email.trim()) {
      setErro("Informe seu e-mail.");
      return;
    }

    if (!senha) {
      setErro("Informe sua senha.");
      return;
    }

    setEntrando(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );

      navigate("/admin");
    } catch (error) {
      console.error(
        "Erro ao entrar no painel:",
        error
      );

      setErro(
        "E-mail ou senha inválidos."
      );
    } finally {
      setEntrando(false);
    }
  };

  return (
    <main className="admin-login">
      <section className="admin-login-card">
        <div className="admin-login-header">
          <span className="admin-label">
            DIVA VITORIA FASHION
          </span>

          <h1>
            Área administrativa
          </h1>

          <p>
            Entre para gerenciar sua loja.
          </p>
        </div>

        {erro && (
          <div className="admin-login-erro">
            {erro}
          </div>
        )}

        <form onSubmit={entrar}>
          <div className="admin-login-campo">
            <label>
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
            />
          </div>

          <div className="admin-login-campo">
            <label>
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              placeholder="Digite sua senha"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={entrando}
          >
            {entrando
              ? "Entrando..."
              : "Entrar no painel"}
          </button>
        </form>

        <button
          type="button"
          className="admin-login-voltar"
          onClick={() =>
            navigate("/loja")
          }
        >
          ← Voltar para a loja
        </button>
      </section>
    </main>
  );
}

export default AdminLogin;