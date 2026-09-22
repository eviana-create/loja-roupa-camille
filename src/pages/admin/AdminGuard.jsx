import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import Admin from "./Admin";

function AdminGuard() {
  const [carregando, setCarregando] =
    useState(true);

  const [autorizado, setAutorizado] =
    useState(false);

  useEffect(() => {
    let ativo = true;

    const cancelar =
      onAuthStateChanged(
        auth,
        async (usuario) => {
          if (!usuario) {
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

            if (ativo) {
              setAutorizado(
                adminSnapshot.exists()
              );

              setCarregando(false);
            }
          } catch (error) {
            console.error(
              "Erro ao verificar administrador:",
              error
            );

            if (ativo) {
              setAutorizado(false);
              setCarregando(false);
            }
          }
        }
      );

    return () => {
      ativo = false;
      cancelar();
    };
  }, []);

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

  return <Admin />;
}

export default AdminGuard;