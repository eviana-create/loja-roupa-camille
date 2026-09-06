import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-main">

        {/* MARCA */}

        <div className="footer-brand">

          <a href="/" className="footer-logo">
            VITRINE
          </a>

          <p>
            Estilo, personalidade e peças escolhidas
            para acompanhar você em todos os momentos.
          </p>

          <a href="#instagram" className="footer-instagram">
            Instagram ↗
          </a>

        </div>

        {/* NAVEGAÇÃO */}

        <div className="footer-column">

          <h3>
            Navegação
          </h3>

          <a href="/">Início</a>
          <a href="#categorias">Categorias</a>
          <a href="#novidades">Novidades</a>
          <a href="#ofertas">Ofertas</a>
          <a href="#instagram">Instagram</a>

        </div>

        {/* ATENDIMENTO */}

        <div className="footer-column">

          <h3>
            Atendimento
          </h3>

          <a href="#contato">Fale conosco</a>
          <a href="#contato">WhatsApp</a>
          <a href="#contato">Dúvidas frequentes</a>
          <a href="#contato">Trocas e devoluções</a>

        </div>

        {/* CONTATO */}

        <div className="footer-column footer-contact">

          <h3>
            Entre em contato
          </h3>

          <p>
            Segunda a sexta
            <br />
            09:00 às 18:00
          </p>

          <a href="mailto:contato@vitrine.com">
            contato@vitrine.com
          </a>

          <a href="https://wa.me/5500000000000">
            WhatsApp ↗
          </a>

        </div>

      </div>

      {/* RODAPÉ INFERIOR */}

      <div className="footer-bottom">

        <span>
          © 2026 VITRINE. Todos os direitos reservados.
        </span>

        <div className="footer-legal">

          <a href="#privacidade">
            Política de privacidade
          </a>

          <a href="#termos">
            Termos de uso
          </a>

        </div>

      </div>

    </footer>
  );
}

export default Footer;