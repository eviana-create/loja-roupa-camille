const produtos = [
  {
    id: "camiseta-oversized-preta",
    nome: "Camiseta Oversized",
    descricao:
      "Camiseta oversized com modelagem confortável e estilo contemporâneo.",
    categoria: "Camisetas",

    preco: 79.9,
    precoPromocional: null,

    imagens: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    ],

    tamanhos: ["P", "M", "G", "GG"],

    cores: [
      {
        nome: "Preto",
        codigo: "#111111",
      },
      {
        nome: "Branco",
        codigo: "#f5f5f5",
      },
    ],

    estoque: {
      P: 8,
      M: 12,
      G: 10,
      GG: 6,
    },

    tags: ["Novidade"],

    destaque: true,
    oferta: false,
    ativo: true,
  },

  {
    id: "calca-wide-leg",
    nome: "Calça Wide Leg",
    descricao:
      "Calça wide leg de caimento moderno, perfeita para composições versáteis.",
    categoria: "Calças",

    preco: 129.9,
    precoPromocional: null,

    imagens: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246",
    ],

    tamanhos: ["36", "38", "40", "42", "44"],

    cores: [
      {
        nome: "Jeans",
        codigo: "#6f7b83",
      },
    ],

    estoque: {
      "36": 4,
      "38": 7,
      "40": 10,
      "42": 8,
      "44": 5,
    },

    tags: ["Destaque"],

    destaque: true,
    oferta: false,
    ativo: true,
  },

  {
    id: "vestido-minimal",
    nome: "Vestido Minimal",
    descricao:
      "Vestido de design minimalista para um visual elegante e atemporal.",
    categoria: "Vestidos",

    preco: 189.9,
    precoPromocional: 149.9,

    imagens: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
    ],

    tamanhos: ["P", "M", "G"],

    cores: [
      {
        nome: "Preto",
        codigo: "#111111",
      },
      {
        nome: "Bege",
        codigo: "#c9b8a5",
      },
    ],

    estoque: {
      P: 5,
      M: 8,
      G: 4,
    },

    tags: ["Oferta"],

    destaque: true,
    oferta: true,
    ativo: true,
  },

  {
    id: "jaqueta-casual",
    nome: "Jaqueta Casual",
    descricao:
      "Jaqueta casual com visual urbano e acabamento pensado para o dia a dia.",
    categoria: "Jaquetas",

    preco: 199.9,
    precoPromocional: null,

    imagens: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5",
    ],

    tamanhos: ["P", "M", "G", "GG"],

    cores: [
      {
        nome: "Preto",
        codigo: "#111111",
      },
      {
        nome: "Marrom",
        codigo: "#6b5547",
      },
    ],

    estoque: {
      P: 3,
      M: 6,
      G: 5,
      GG: 2,
    },

    tags: ["Novidade"],

    destaque: false,
    oferta: false,
    ativo: true,
  },
];

export default produtos;