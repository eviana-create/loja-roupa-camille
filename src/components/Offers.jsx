import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";

import "./Offers.css";

function Offers() {
  const [produto, setProduto] = useState(null);
  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {
    async function carregarOferta() {
      try {
        const snapshot = await getDocs(
          collection(db, "produtos")
        );

        const produtosFirebase =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        const produtoOferta =
          produtosFirebase.find(
            (item) =>
              item.nome === "Vestido Midi Elegance" &&
              item.oferta === true &&
              item.ativo !== false
          );

        setProduto(produtoOferta || null);
      } catch (error) {
        console.error(
          "Erro ao carregar oferta:",
          error
        );

        setProduto(null);
      } finally {
        setCarregando(false);
      }
    }

    carregarOferta();
  }, []);

  if (carregando || !produto) {
    return null;
  }

  const preco =
    Number(produto.preco) || 0;

  const precoPromocional =
    produto.precoPromocional !== null &&
    produto.precoPromocional !== undefined
      ? Number(produto.precoPromocional)
      : null;

  const desconto =
    precoPromocional !== null &&
    preco > 0
      ? Math.round(
          ((preco - precoPromocional) /
            preco) *
            100
        )
      : 0;

  return (
    <section
      className="offers"
      id="ofertas"
    >
      <div className="offers-content">

        <span className="offers-label">
          OFERTA ESPECIAL
        </span>

        <h2>
          Seu estilo.
          <br />
          Seu momento.
          <br />
          Seu desconto.
        </h2>

        <p>
          Aproveite condições especiais em peças
          selecionadas por tempo limitado.
        </p>

        <a
          href="#produtos"
          className="offers-button"
        >
          Aproveitar oferta
          <span>→</span>
        </a>

      </div>

      <div className="offers-product">

        <span className="offers-discount">
          -{desconto}%
        </span>

        <img
          src={produto.imagens?.[0]}
          alt={produto.nome}
        />

        <div className="offers-product-info">

          <div>
            <span>
              {produto.categoria?.toUpperCase()}
            </span>

            <h3>
              {produto.nome}
            </h3>
          </div>

          <div className="offers-price">

            {precoPromocional !== null && (
              <span className="offers-old-price">
                R$ {preco.toFixed(2).replace(".", ",")}
              </span>
            )}

            <strong>
              R$ {(
                precoPromocional ??
                preco
              )
                .toFixed(2)
                .replace(".", ",")}
            </strong>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Offers;
