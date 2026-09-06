import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Offers from "./components/Offers";
import Benefits from "./components/Benefits";
import Instagram from "./components/Instagram";

function App() {
  return (
    <>
      <Header />
      <Hero />
      <Categories />
      <Products />
      <Offers />
      <Benefits />
      <Instagram />


      <main
        style={{
          minHeight: "100vh",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h1>Minha Loja</h1>

        <p style={{ marginTop: "15px" }}>
          Nossa loja está começando.
        </p>
      </main>
    </>
  );
}

export default App;