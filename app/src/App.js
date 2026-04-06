import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { SearchProvider } from "./context/SearchContext";
import { AuthProvider } from "./hooks/useAuth";
import { usePageView } from "./hooks/useAnalytics";
import Header from "./components/Header";
import "./App.css";

// Critical path — load immediately
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";

// Public pages — lazy loaded
const Contact = lazy(() => import("./pages/Contact"));
const About = lazy(() => import("./pages/About"));
const FAQs = lazy(() => import("./pages/FAQs"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Cookies = lazy(() => import("./pages/Cookies"));
const SGGallery = lazy(() => import("./pages/SGGallery"));
const SGGalleryCollection = lazy(() => import("./pages/SGGalleryCollection"));

// Admin pages — lazy loaded
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductEdit = lazy(() => import("./pages/admin/AdminProductEdit"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminImages = lazy(() => import("./pages/admin/AdminImages"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminSGCollections = lazy(() => import("./pages/admin/AdminSGCollections"));
const AdminSGPhotos = lazy(() => import("./pages/admin/AdminSGPhotos"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminProductSGRelations = lazy(() => import("./pages/admin/AdminProductSGRelations"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));

// Fallback mínimo mientras se carga una página lazy
function PageLoader() {
  return <div className="min-h-screen bg-black" />;
}

function PublicLayout() {
  usePageView();
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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin-jdm-private" element={<AdminLogin />} />
                <Route path="/admin-jdm-private/*" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/:code" element={<AdminProductEdit />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="images" element={<AdminImages />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="home" element={<AdminHome />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="sg-gallery" element={<AdminSGCollections />} />
                  <Route path="sg-gallery/:collectionId/photos" element={<AdminSGPhotos />} />
                  <Route path="product-sg-relations" element={<AdminProductSGRelations />} />
                </Route>

                {/* Public Routes */}
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
            </Suspense>
          </SearchProvider>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
