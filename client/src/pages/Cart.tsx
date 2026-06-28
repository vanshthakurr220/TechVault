import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Package,
  Truck,
  Lock,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Link } from "wouter";

interface CartItem {
  productId: {
    _id: string;
    name: string;
    images: string[];
    price: number;
    brand: string;
    category: string;
    model: string;
    rating?: number;
  };

  quantity: number;
  _id: string;
}

export default function Cart() {
  const [loading, setLoading] = useState(true);

  const { user, cartItems, getCartItems, updateCartQuantity, removeFromCart } =
    useApp();
  const items = cartItems as unknown as CartItem[];

  // =========================
  // FETCH CART
  // =========================

  const fetchCart = async () => {
    try {
      setLoading(true);

      if (!user?.email) {
        setLoading(false);
        return;
      }

      await getCartItems();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [getCartItems, user?.email]);

  // =========================
  // UPDATE QUANTITY
  // =========================

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(productId);
    }

    try {
      await updateCartQuantity(productId, quantity);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // REMOVE ITEM
  // =========================

  const removeItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // CALCULATIONS
  // =========================

  const subtotal = items.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0,
  );

  const shipping = subtotal > 50000 ? 0 : 0;

  const total = subtotal + shipping;

  // =========================
  // EMPTY CART
  // =========================

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-slate-200/50 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-slate-400" />
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Your Cart is Empty
          </h2>

          <p className="text-slate-600 mb-8 text-lg">
            Looks like you haven't added anything yet. Explore our products and
            find something you love!
          </p>

          <Link href="/products">
            <Button className="inline-flex items-center gap-2 h-12 px-8 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
              Continue Shopping
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingBag size={32} className="text-primary" />
            Shopping Cart
          </h1>
          <p className="text-slate-600 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="flex gap-6 p-6">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.productId.images[0]}
                      alt={item.productId.name}
                      className="w-32 h-32 rounded-xl object-cover bg-slate-100 shadow-sm"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 mb-1">
                          {item.productId.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                            {item.productId.brand}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                            {item.productId.category}
                          </span>
                          {item.productId.model && (
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                              {item.productId.model}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500 hover:text-red-600"
                        title="Remove from cart"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Price and Stock Info */}
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ₹{item.productId.price.toLocaleString()}
                        </p>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-block mt-1">
                          ✓ In Stock
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600 mb-1">
                          Item Total
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          ₹
                          {(
                            item.productId.price * item.quantity
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Quantity
                      </span>
                      <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId._id,
                              item.quantity - 1,
                            )
                          }
                          className="p-2 hover:bg-slate-100 transition-colors text-slate-600"
                          title="Decrease quantity"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="px-6 py-2 font-bold text-slate-900 min-w-16 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId._id,
                              item.quantity + 1,
                            )
                          }
                          className="p-2 hover:bg-slate-100 transition-colors text-slate-600"
                          title="Increase quantity"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY SIDEBAR */}
          <div className="lg:col-span-1">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Shipping</span>
                  <span className="font-semibold text-slate-900">
                    <span className="text-emerald-600">Free</span>
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 pt-4"></div>

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout">
                <Button className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all mb-4">
                  Proceed to Checkout
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>

              {/* Continue Shopping */}
              <Link href="/products">
                <Button
                  variant="outline"
                  className="w-full h-12 font-semibold rounded-xl border-2"
                >
                  Continue Shopping
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-8 space-y-3 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Truck size={16} className="text-blue-600" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    Fast & Free Shipping
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Lock size={16} className="text-green-600" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    Secure Checkout
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <Package size={16} className="text-purple-600" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    Easy Returns
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
