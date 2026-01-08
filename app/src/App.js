import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import "./App.css";

function App() {
  return (
    <CartProvider>
      <Router>
        <SearchProvider>
          <div className="flex min-h-screen flex-col bg-black text-white">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:categoryId" element={<Shop />} />
                <Route path="/product/:categoryId/:productCode" element={<ProductDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/checkout" element={<Checkout />} />
              </Routes>
            </main>
          </div>
        </SearchProvider>
      </Router>
    </CartProvider>
  );
}

export default App;
