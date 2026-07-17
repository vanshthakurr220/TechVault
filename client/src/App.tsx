import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppProvider } from "./contexts/AppContext";
import Home from "./pages/Home";
import AllProducts from "./pages/AllProducts";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import SignupWithOTP from "./pages/SignupWithOTP";
import ContactUs from "./pages/ContactUs";
import About from "./pages/About";
import ProfileWithOTP from "./pages/ProfileWithOTP";
import Cart from "./pages/Cart";

import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "react-toastify/dist/ReactToastify.css";
import AdminHome from "./pages/AdminHome";
import AdminUsers from "./pages/AdminUsers";
import AdminContacts from "./pages/AdminContacts";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import Checkout from "./pages/Checkout";
import PlaceOrder from "./pages/PlaceOrder";
import Wishlist from "./pages/Wishlist";
import AdminReviews from "./pages/AdminReviews";
import AdminWishlists from "./pages/AdminWishlists";
import AdminCoupons from "./pages/AdminCoupons";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import { NotificationProvider } from "./components/Notification";
import AdminProductQuestions from "./pages/AdminProductQuestions";
import AdminAnalytics from "./pages/AdminAnalytics";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={AllProducts} />
          <Route path="/product/:id" component={ProductDetail} />
          <Route path="/login">
            <GuestRoute>
              <Login />
            </GuestRoute>
          </Route>
          <Route path="/signup">
            <GuestRoute>
              <SignupWithOTP />
            </GuestRoute>
          </Route>
          <Route path="/contact" component={ContactUs} />
          <Route path="/about" component={About} />
          <Route path="/profile">
            <ProtectedRoute>
              <ProfileWithOTP />
            </ProtectedRoute>
          </Route>
          {/* Route for AdminHome and its sub-routes */}
          <Route path="/admin">
            <ProtectedRoute adminOnly>
              <AdminHome />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/analytics">
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/users">
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/contacts">
            <ProtectedRoute adminOnly>
              <AdminContacts />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/products">
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/product-questions">
            <ProtectedRoute adminOnly>
              <AdminProductQuestions />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/orders">
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/reviews">
            <ProtectedRoute adminOnly>
              <AdminReviews />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/wishlists">
            <ProtectedRoute adminOnly>
              <AdminWishlists />
            </ProtectedRoute>
          </Route>

          <Route path="/admin/coupons">
            <ProtectedRoute adminOnly>
              <AdminCoupons />
            </ProtectedRoute>
          </Route>

          <Route path="/cart">
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          </Route>
          <Route path="/checkout">
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </Route>
          <Route path="/place-order">
            <ProtectedRoute>
              <PlaceOrder />
            </ProtectedRoute>
          </Route>
          <Route path="/orders">
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          </Route>
          <Route path="/wishlist">
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          </Route>
          <Route path="/404" component={NotFound} />
          {/* Default catch-all route for 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AppProvider>
          <TooltipProvider>
            <Router />
          </TooltipProvider>
        </AppProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
