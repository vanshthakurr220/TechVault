import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Link } from "wouter";
import Swal from "sweetalert2";
import Loader from "@/components/Loader";
import { navigate } from "wouter/use-browser-location";

interface WishlistItem {
  productId: {
    _id: string;
    name: string;
    image?: string; // old products
    images?: string[]; // new products
    price: number;
    brand: string;
    inStock: boolean;
  };

  _id: string;
}

export default function Wishlist() {
  const [loading, setLoading] = useState(true);

  const {
    user,
    wishlistItems,
    getWishlistItems,
    removeFromWishlist,
    addToCart,
  } = useApp();
  const items = wishlistItems as WishlistItem[];

  // =========================
  // FETCH WISHLIST
  // =========================

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      if (!user?.email) {
        setLoading(false);
        return;
      }

      await getWishlistItems();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [getWishlistItems, user?.email]);

  // =========================
  // REMOVE ITEM FROM WISHLIST
  // =========================

  const removeItem = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // ADD TO CART
  // =========================

  const addToCartFromWishlist = async (
    productId: string,
    productName: string,
  ) => {
    try {
      if (!user?.email) {
        Swal.fire({
          icon: "warning",
          title: "Login Required",
          text: "Please login first",
        });

        return;
      }

      await addToCart(productId, 1);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not add product to cart",
      });
    }
  };

  // =========================
  // EMPTY WISHLIST
  // =========================

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart size={60} className="mx-auto opacity-40" />

          <h2 className="text-2xl font-bold mt-4">Your wishlist is empty</h2>

          <a href="/products">
            <Button className="mt-6">
              Continue Shopping
              <ArrowRight />
            </Button>
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loader text="Loading wishlist..." variant="page" />;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">❤️ My Wishlist</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ITEMS */}

          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                onClick={() => navigate(`/product/${item.productId._id}`)}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
              >
                <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                  <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={
                        item.productId.images?.[0] ||
                        item.productId.image ||
                        "/placeholder.png"
                      }
                      alt={item.productId.name}
                      className="max-w-full max-h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    />

                    {!item.productId.inStock && (
                      <span className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1 text-[10px] font-bold text-white shadow-sm">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {item.productId.brand}
                      </p>

                      <h3 className="line-clamp-2 text-lg sm:text-xl font-black leading-tight text-slate-900 transition-colors group-hover:text-primary">
                        {item.productId.name}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-sm font-black text-primary">
                          ₹{item.productId.price.toLocaleString()}
                        </span>

                        {item.productId.inStock ? (
                          <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-100">
                            In Stock
                          </span>
                        ) : (
                          <span className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-100">
                            Currently unavailable
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-3">
                      <Button
                        disabled={!item.productId.inStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCartFromWishlist(
                            item.productId._id,
                            item.productId.name,
                          );
                        }}
                        className="h-11 flex-1 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Add to Cart
                      </Button>

                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.productId._id);
                        }}
                        className="h-11 flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-bold transition-all"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SUMMARY */}

          <div className="border p-6 rounded-lg h-fit">
            <h2 className="text-xl font-bold mb-4">Wishlist Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Items</span>

                <span className="font-bold">{items.length}</span>
              </div>

              <div className="flex justify-between">
                <span>In Stock</span>

                <span className="font-bold">
                  {items.filter((item) => item.productId.inStock).length}
                </span>
              </div>

              <hr />

              <div className="flex justify-between font-bold text-lg">
                <span>Total Value</span>

                <span>
                  ₹
                  {items
                    .reduce((sum, item) => sum + item.productId.price, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>

            <Link href="/products">
              <Button className="w-full mt-6">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
