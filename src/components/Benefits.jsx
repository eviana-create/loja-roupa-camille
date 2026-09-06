import "./Benefits.css";

const beneficios = [
  {
    id: 1,
    icone: "↗",
    titulo: "Envio para todo o Brasil",
    descricao: "Receba suas peças onde estiver.",
  },
  {
    id: 2,
    icone: "◇",
    titulo: "Compra segura",
    descricao: "Seus dados protegidos em todas as etapas.",
  },
  {
    id: 3,
    icone: "◫",
    titulo: "Pagamento facilitado",
    descricao: "Escolha a melhor forma de pagamento.",
  },
  {
    id: 4,
    icone: "♡",
    titulo: "Atendimento personalizado",
    descricao: "Estamos aqui para ajudar você.",
  },
];

function Benefits() {
  return (
    <section className="benefits">

      <div className="benefits-grid">

        {beneficios.map((beneficio) => (
          <div className="benefit-item" key={beneficio.id}>

            <div className="benefit-icon">
              {beneficio.icone}
            </div>

            <div className="benefit-content">

              <h3>
                {beneficio.titulo}
              </h3>

              <p>
                {beneficio.descricao}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default Benefits;