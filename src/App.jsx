import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Offers from "./components/Offers";
import Benefits from "./components/Benefits";
import Instagram from "./components/Instagram";
import Footer from "./components/Footer";

import Loja from "./pages/Loja";

function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <Categories />
        <Products />
        <Offers />
        <Benefits />
        <Instagram />
      </main>

      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/loja" element={<Loja />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;