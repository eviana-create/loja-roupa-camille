import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import {
  auth,
  db,
} from "../../firebase/firebaseConfig";
import Admin from "./Admin";

const TEMPO_INATIVIDADE =
  30 * 60 * 1000;

const TEMPO_AVISO =
  25 * 60 * 1000;

function AdminGuard() {
  const [carregando, setCarregando] =
    useState(true);

  const [autorizado, setAutorizado] =
    useState(false);

  const [mostrarAviso, setMostrarAviso] =
    useState(false);

  const timerLogout =
    useRef(null);

  const timerAviso =
    useRef(null);

  const atividadeTimer =
    useRef(null);

  const encerrarSessao = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(
        "Erro ao encerrar sessão:",
        error
      );
    }
  };

  const limparTimers = () => {
    if (timerLogout.current) {
      clearTimeout(
        timerLogout.current
      );
    }

    if (timerAviso.current) {
      clearTimeout(
        timerAviso.current
      );
    }

    if (atividadeTimer.current) {
      clearTimeout(
        atividadeTimer.current
      );
    }
  };

  const iniciarControleInatividade =
    () => {
      limparTimers();

      setMostrarAviso(false);

      timerAviso.current =
        setTimeout(() => {
          setMostrarAviso(true);
        }, TEMPO_AVISO);

      timerLogout.current =
        setTimeout(() => {
          encerrarSessao();
        }, TEMPO_INATIVIDADE);
    };

  useEffect(() => {
    let ativo = true;

    const cancelar =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
            limparTimers();

            if (ativo) {
              setAutorizado(false);
              setCarregando(false);
            }

            return;
          }

          try {
            const adminRef = doc(
              db,
              "admins",
              usuario.uid
            );

            const adminSnapshot =
              await getDoc(adminRef);

            if (!ativo) {
              return;
            }

            if (
              !adminSnapshot.exists()
            ) {
              await signOut(auth);

              setAutorizado(false);
              setCarregando(false);

              return;
            }

            setAutorizado(true);
            setCarregando(false);

            iniciarControleInatividade();
          } catch (error) {
            console.error(
              "Erro ao verificar administrador:",
              error
            );

            limparTimers();

            if (ativo) {
              setAutorizado(false);
              setCarregando(false);
            }
          }
        }
      );

    return () => {
      ativo = false;

      limparTimers();
      cancelar();
    };
  }, []);

  useEffect(() => {
    if (!autorizado) {
      return;
    }

    const registrarAtividade =
      () => {
        if (
          atividadeTimer.current
        ) {
          return;
        }

        atividadeTimer.current =
          setTimeout(() => {
            atividadeTimer.current =
              null;

            setMostrarAviso(
              false
            );

            iniciarControleInatividade();
          }, 500);
      };

    const eventos = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    eventos.forEach((evento) => {
      window.addEventListener(
        evento,
        registrarAtividade,
        { passive: true }
      );
    });

    return () => {
      eventos.forEach((evento) => {
        window.removeEventListener(
          evento,
          registrarAtividade
        );
      });
    };
  }, [autorizado]);

  if (carregando) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f5f3",
        }}
      >
        Verificando acesso...
      </main>
    );
  }

  if (!autorizado) {
    return (
      <Navigate
        to="/login-admin"
        replace
      />
    );
  }

  return (
    <>
      <Admin />

      {mostrarAviso && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "grid",
            placeItems: "center",
            padding: "20px",
            background:
              "rgba(0, 0, 0, 0.45)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "430px",
              padding: "30px",
              borderRadius: "20px",
              background: "#fff",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.18)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "2.5rem",
                marginBottom: "12px",
              }}
            >
              ⏳
            </div>

            <h2
              style={{
                margin:
                  "0 0 10px",
              }}
            >
              Sua sessão está quase expirando
            </h2>

            <p
              style={{
                margin:
                  "0 0 22px",
                color: "#666",
                lineHeight: "1.5",
              }}
            >
              Você está há 25 minutos
              sem atividade. Por segurança,
              o painel será encerrado
              automaticamente em 5 minutos.
            </p>

            <button
              type="button"
              onClick={() => {
                setMostrarAviso(false);
                iniciarControleInatividade();
              }}
              style={{
                width: "100%",
                minHeight: "50px",
                border: "none",
                borderRadius: "11px",
                background: "#222",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Continuar sessão
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminGuard;