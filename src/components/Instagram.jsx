import "./Instagram.css";

const imagens = [
  {
    id: 1,
    imagem:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b",
    alt: "Look feminino",
  },
  {
    id: 2,
    imagem:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
    alt: "Look de moda",
  },
  {
    id: 3,
    imagem:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b",
    alt: "Look casual",
  },
  {
    id: 4,
    imagem:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e",
    alt: "Moda feminina",
  },
  {
    id: 5,
    imagem:
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc",
    alt: "Estilo urbano",
  },
  {
    id: 6,
    imagem:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c",
    alt: "Coleção de moda",
  },
];

function Instagram() {
  return (
    <section className="instagram" id="instagram">

      <div className="instagram-header">

        <div>
          <span className="instagram-label">
            SIGA A VITRINE
          </span>

          <h2>
            Inspire-se.
          </h2>
        </div>

        <div className="instagram-description">

          <p>
            Descubra looks, combinações e
            novidades no nosso Instagram.
          </p>

          <a href="#instagram" className="instagram-link">
            @vitrine
            <span>↗</span>
          </a>

        </div>

      </div>

      <div className="instagram-grid">

        {imagens.map((item) => (
          <a
            href="#instagram"
            className="instagram-item"
            key={item.id}
          >

            <img
              src={item.imagem}
              alt={item.alt}
            />

            <div className="instagram-overlay">
              <span>Instagram</span>
              <strong>↗</strong>
            </div>

          </a>
        ))}

      </div>

    </section>
  );
}

export default Instagram;