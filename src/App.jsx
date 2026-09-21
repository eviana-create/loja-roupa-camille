import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { useEffect } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import Products from "./components/Products";
import Offers from "./components/Offers";
import Benefits from "./components/Benefits";
import Instagram from "./components/Instagram";
import Footer from "./components/Footer";

import Loja from "./pages/Loja";
import Produto from "./pages/Produto";

import { CarrinhoProvider } from "./context/CarrinhoContext";
import Carrinho from "./pages/Carrinho";

import Checkout from "./pages/Checkout";

import PedidoConfirmado from "./pages/PedidoConfirmado";
import Admin from "./pages/admin/Admin";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function Home() {
  return (
    <main>
      <Hero />
      <Categories />
      <Products />
      <Offers />
      <Benefits />
      <Instagram />
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CarrinhoProvider>
        <ScrollToTop />

        <Routes>

          <Route
            path="/"
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />

          <Route
            path="/loja"
            element={
              <Layout>
                <Loja />
              </Layout>
            }
          />

          <Route
            path="/loja/produto/:id"
            element={
              <Layout>
                <Produto />
              </Layout>
            }
          />

          <Route
            path="/carrinho"
            element={
              <Layout>
                <Carrinho />
              </Layout>
            }
          />

          <Route
            path="/checkout"
            element={
              <Layout>
                <Checkout />
              </Layout>
            }
          />

          <Route
            path="/pedido-confirmado"
            element={
              <Layout>
                <PedidoConfirmado />
              </Layout>
            }
          />

          <Route
            path="/admin"
            element={<Admin />    
            }
          />

        </Routes>
      </CarrinhoProvider>
    </BrowserRouter>
  );
}

export default App;