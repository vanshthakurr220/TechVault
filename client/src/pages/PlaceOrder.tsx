import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, Package } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

interface Order {
  _id: string;
  totalAmount: number;
  couponCode?: string;
  couponDiscount?: number;
  createdAt: string;
  items: {
    name: string;
    images: string[];
    quantity: number;
    price: number;
  }[];
}

export default function PlaceOrder() {
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const latestOrder = sessionStorage.getItem("latestOrder");

    if (latestOrder) {
      try {
        setOrder(JSON.parse(latestOrder));
      } catch (error) {
        console.error("Failed to parse latest order:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <div className="max-w-2xl w-full border border-border rounded-2xl p-8 bg-card shadow-sm">
        <CheckCircle size={80} className="mx-auto text-green-600 mb-6" />

        <h1 className="text-4xl font-bold text-center mb-3">
          Order Placed Successfully
        </h1>

        <p className="text-muted-foreground text-center mb-8">
          Thank you for shopping with us. Your order has been received and is
          now being processed.
        </p>

        {/* ORDER SUMMARY */}
        <div className="bg-secondary/30 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package size={18} />
            <span className="font-semibold">Status: Pending</span>
          </div>

          {order ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>

                <span className="font-medium">#{order._id?.slice(-8)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>

                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Items</span>

                <span>
                  {order.items?.reduce((sum, item) => sum + item.quantity, 0) ??
                    0}
                </span>
              </div>

              {order.couponCode && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coupon Applied</span>

                  <span className="text-green-600 font-medium">
                    {order.couponCode}
                  </span>
                </div>
              )}

              {(order.couponDiscount ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>

                  <span className="text-green-600">
                    -₹{(order.couponDiscount ?? 0).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-t pt-3 font-semibold text-base">
                <span>Total Paid</span>

                <span>₹{order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Order details unavailable.
            </p>
          )}
        </div>

        {/* ORDERED ITEMS */}
        {order?.items?.length ? (
          <div className="border rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-lg mb-4">Ordered Items</h3>

            <div className="space-y-3">
              {order.items.slice(0, 3).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border rounded-lg p-3"
                >
                  <img
                    src={
                      item.images && item.images.length > 0
                        ? item.images[0]
                        : "/placeholder.png"
                    }
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md border"
                  />

                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.name}</p>

                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}

              {order.items.length > 3 && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  + {order.items.length - 3} more item(s)
                </div>
              )}
            </div>
          </div>
        ) : null}

        <p className="text-sm text-muted-foreground text-center mb-8">
          You can track your order anytime from your orders page.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/orders" className="flex-1">
            <Button className="w-full flex gap-2">
              <Package size={18} />
              View Orders
            </Button>
          </Link>

          <Link href="/products" className="flex-1">
            <Button variant="outline" className="w-full flex gap-2">
              <ShoppingBag size={18} />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
