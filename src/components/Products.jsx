import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

import ProductCard from "./ProductCard";

import "./Products.css";

function Products() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] =
    useState(true);

 useEffect(() => {
  setCarregando(true);

  const produtosRef = collection(db, "produtos");

  const cancelarInscricao = onSnapshot(
    produtosRef,
    (snapshot) => {
      const produtosFirebase =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      const produtosAtivos =
        produtosFirebase.filter(
          (produto) =>
            produto.ativo !== false
        );

      setProdutos(produtosAtivos);
      setCarregando(false);
    },
    (error) => {
      console.error(
        "Erro ao acompanhar produtos do Firebase:",
        error
      );

      setProdutos([]);
      setCarregando(false);
    }
  );

  return () => {
    cancelarInscricao();
  };
}, []);

  return (
    <section
      className="products"
      id="novidades"
    >
      <div className="products-header">
        <div>
          <span className="section-label">
            NOSSA SELEÇÃO
          </span>

          <h2>Novidades</h2>
        </div>

        <a
          href="/loja"
          className="view-all"
        >
          Ver todos
          <span>→</span>
        </a>
      </div>

      {carregando ? (
        <div>
          Carregando novidades...
        </div>
      ) : (
        <div className="products-grid">
          {produtos.map((produto) => {
            const preco =
              typeof produto.preco ===
              "number"
                ? produto.preco
                : Number(produto.preco) || 0;

            const precoPromocional =
              produto.precoPromocional !==
                null &&
              produto.precoPromocional !==
                undefined
                ? Number(
                    produto.precoPromocional
                  )
                : null;

            return (
              <ProductCard
                key={produto.id}
                produto={{
                  ...produto,

                  preco:
                    precoPromocional !==
                    null
                      ? `R$ ${precoPromocional
                          .toFixed(2)
                          .replace(
                            ".",
                            ","
                          )}`
                      : `R$ ${preco
                          .toFixed(2)
                          .replace(
                            ".",
                            ","
                          )}`,

                  precoAntigo:
                    precoPromocional !==
                    null
                      ? `R$ ${preco
                          .toFixed(2)
                          .replace(
                            ".",
                            ","
                          )}`
                      : null,
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Products;
