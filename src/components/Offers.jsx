import "./Offers.css";

function Offers() {
  return (
    <section className="offers" id="ofertas">

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

        <a href="#produtos" className="offers-button">
          Aproveitar oferta
          <span>→</span>
        </a>

      </div>

      <div className="offers-product">

        <span className="offers-discount">
          -20%
        </span>

        <img
          src="https://images.unsplash.com/photo-1595777457583-95e059d581b8"
          alt="Vestido em oferta"
        />

        <div className="offers-product-info">

          <div>
            <span>VESTIDOS</span>
            <h3>Vestido Minimal</h3>
          </div>

          <div className="offers-price">
            <span className="offers-old-price">
              R$ 189,90
            </span>

            <strong>
              R$ 149,90
            </strong>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Offers;