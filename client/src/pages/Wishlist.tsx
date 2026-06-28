import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Link } from "wouter";
import Swal from "sweetalert2";

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

      Swal.fire({
        icon: "success",
        title: "Removed",
        text: "Item removed from wishlist",
        timer: 1300,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not remove item",
      });
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

      Swal.fire({
        icon: "success",
        title: "Added To Cart",
        text: `${productName} added to cart`,
        timer: 1300,
        showConfirmButton: false,
      });
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading wishlist...
      </div>
    );
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
                className="flex gap-4 border p-4 rounded-lg hover:shadow-md transition-shadow"
              >
                <img
                  src={
                    item.productId.images?.[0] ||
                    item.productId.image ||
                    "/placeholder.png"
                  }
                  className="w-20 h-20 rounded object-contain bg-slate-50 p-2"
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

                <div className="flex flex-col gap-2 justify-center">
                  <Button
                    disabled={!item.productId.inStock}
                    onClick={() =>
                      addToCartFromWishlist(
                        item.productId._id,
                        item.productId.name,
                      )
                    }
                    className="text-xs"
                    size="sm"
                  >
                    🛒 Add to Cart
                  </Button>

                  <button
                    onClick={() => removeItem(item.productId._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
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
