import "./Categories.css";

const categorias = [
  {
    id: 1,
    nome: "Feminino",
    imagem: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
  },
  {
    id: 2,
    nome: "Masculino",
    imagem: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891",
  },
  {
    id: 3,
    nome: "Acessórios",
    imagem: "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561",
  },
];

function Categories() {
  return (
    <section className="categories" id="categorias">

      <div className="categories-header">
        <span>CATEGORIAS</span>

        <h2>
          Encontre seu estilo
        </h2>
      </div>

      <div className="categories-grid">

        {categorias.map((categoria) => (
          <a
            href="#produtos"
            className="category-card"
            key={categoria.id}
          >

            <img
              src={categoria.imagem}
              alt={categoria.nome}
            />

            <div className="category-overlay">
              <h3>{categoria.nome}</h3>

              <span>
                Explorar →
              </span>
            </div>

          </a>
        ))}

      </div>

    </section>
  );
}

export default Categories;