import { createContext, useContext, useEffect, useState } from "react";

const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState(() => {
    try {
      const carrinhoSalvo = localStorage.getItem("carrinho");

      return carrinhoSalvo
        ? JSON.parse(carrinhoSalvo)
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "carrinho",
      JSON.stringify(itens)
    );
  }, [itens]);

  const adicionarItem = ({
    produto,
    tamanho,
    cor,
    quantidade,
  }) => {
    setItens((itensAtuais) => {
      const itemExistente = itensAtuais.find(
        (item) =>
          item.produtoId === produto.id &&
          item.tamanho === tamanho &&
          item.cor === cor
      );

      if (itemExistente) {
        return itensAtuais.map((item) =>
          item.produtoId === produto.id &&
          item.tamanho === tamanho &&
          item.cor === cor
            ? {
                ...item,
                quantidade:
                  item.quantidade + quantidade,
              }
            : item
        );
      }

      return [
        ...itensAtuais,
        {
          id: `${produto.id}-${tamanho}-${cor}`,
          produtoId: produto.id,
          nome: produto.nome,
          imagem: produto.imagens?.[0],
          preco:
            produto.precoPromocional ||
            produto.preco,
          tamanho,
          cor,
          quantidade,
        },
      ];
    });
  };

  const removerItem = (id) => {
    setItens((itensAtuais) =>
      itensAtuais.filter((item) => item.id !== id)
    );
  };

  const aumentarQuantidade = (id) => {
    setItens((itensAtuais) =>
      itensAtuais.map((item) =>
        item.id === id
          ? {
              ...item,
              quantidade: item.quantidade + 1,
            }
          : item
      )
    );
  };

  const diminuirQuantidade = (id) => {
    setItens((itensAtuais) =>
      itensAtuais
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantidade: item.quantidade - 1,
              }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  };

  const limparCarrinho = () => {
    setItens([]);
  };

  const quantidadeTotal = itens.reduce(
    (total, item) =>
      total + item.quantidade,
    0
  );

  const subtotal = itens.reduce(
    (total, item) =>
      total +
      item.preco * item.quantidade,
    0
  );

  return (
    <CarrinhoContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        aumentarQuantidade,
        diminuirQuantidade,
        limparCarrinho,
        quantidadeTotal,
        subtotal,
      }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}