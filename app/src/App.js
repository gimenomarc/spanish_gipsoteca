import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./hooks/useAuth";
import Header from "./components/Header";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import About from "./pages/About";
import FAQs from "./pages/FAQs";
import SGGallery from "./pages/SGGallery";
import SGGalleryCollection from "./pages/SGGalleryCollection";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductEdit from "./pages/admin/AdminProductEdit";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminImages from "./pages/admin/AdminImages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSGCollections from "./pages/admin/AdminSGCollections";
import AdminSGPhotos from "./pages/admin/AdminSGPhotos";

import "./App.css";

// Layout para rutas públicas con Header
function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <SearchProvider>
            <Routes>
              {/* Admin Routes - Sin Header */}
              <Route path="/admin-jdm-private" element={<AdminLogin />} />
              <Route path="/admin-jdm-private/*" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/:code" element={<AdminProductEdit />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="images" element={<AdminImages />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="sg-gallery" element={<AdminSGCollections />} />
                <Route path="sg-gallery/:collectionId/photos" element={<AdminSGPhotos />} />
              </Route>

              {/* Public Routes - Con Header */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:categoryId" element={<Shop />} />
                <Route path="/product/:categoryId/:productCode" element={<ProductDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/faqs" element={<FAQs />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/sg-gallery" element={<SGGallery />} />
                <Route path="/sg-gallery/:collectionSlug" element={<SGGalleryCollection />} />
              </Route>
            </Routes>
          </SearchProvider>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
