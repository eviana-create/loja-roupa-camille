import "./Hero.css";

function Hero() {
  return (
    <section className="hero">

      <div className="hero-content">

        <span className="hero-label">
          NOVA COLEÇÃO
        </span>

        <h1>
          Vista seu estilo.
          <br />
          Viva sua essência.
        </h1>

        <p>
          Descubra peças escolhidas para
          combinar com você.
        </p>

        <a href="#novidades" className="hero-button">
          Comprar agora
          <span>→</span>
        </a>

      </div>

      <div className="hero-image">

        <div className="hero-image-placeholder">
          <span>IMAGEM DA COLEÇÃO</span>
        </div>

      </div>

    </section>
  );
}

export default Hero;