import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Heart } from "lucide-react";
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
                className="flex flex-col sm:flex-row gap-4 border border-slate-200 bg-white p-4 rounded-2xl hover:shadow-lg hover:border-slate-300 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={
                    item.productId.images?.[0] ||
                    item.productId.image ||
                    "/placeholder.png"
                  }
                  className="w-24 h-24 sm:w-20 sm:h-20 rounded-xl object-contain bg-slate-50 p-2 border"
                  alt={item.productId.name}
                />

                <div className="flex-1">
                  <h3 className="font-bold">{item.productId.name}</h3>

                  <p className="text-sm text-muted-foreground mb-2">
                    {item.productId.brand}
                  </p>

                  <p className="text-primary font-bold">
                    ₹{item.productId.price.toLocaleString()}
                  </p>

                  {!item.productId.inStock && (
                    <p className="text-xs text-red-500 font-semibold mt-1">
                      Out of Stock
                    </p>
                  )}
                </div>

                <div className="flex flex-row sm:flex-col gap-2 justify-center sm:items-end">
                  <Button
                    disabled={!item.productId.inStock}
                    onClick={(e) => {
                      e.stopPropagation();

                      addToCartFromWishlist(
                        item.productId._id,
                        item.productId.name,
                      );
                    }}
                    className="text-xs"
                    size="sm"
                  >
                    🛒 Add to Cart
                  </Button>

                  <button
  onClick={(e) => {
    e.stopPropagation();
    removeItem(item.productId._id);
  }}
  className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
>
  <Trash2 size={16} />
  <span className="hidden sm:inline text-sm font-medium">
    Remove
  </span>
</button>
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
