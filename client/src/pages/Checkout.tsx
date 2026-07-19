import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import { toast } from "react-toastify";
import Loader from "@/components/Loader";

export default function Checkout() {
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [eligibleCouponsLoading, setEligibleCouponsLoading] = useState(false);
  const [, navigate] = useLocation();
  const {
    user,
    addresses,
    fetchAddresses,
    getCartItems,
    createOrder,
    validateCoupon,
    getEligibleCoupons,
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "COD",
  });

  // Track if address has been auto-filled to prevent overwriting manual edits
  const isAutoFilled = useRef(false);

  // Memoize loadCart to prevent it being a dependency that changes
  const loadCart = useCallback(async () => {
    try {
      const items = await getCartItems();
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart items");
    }
  }, [getCartItems]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");

    if (mode === "buynow") {
      const items = JSON.parse(sessionStorage.getItem("buyNowItems") || "[]");
      setCartItems(items);
    } else {
      loadCart();
    }

    fetchAddresses();
  }, [user?.email, loadCart, fetchAddresses]);

  useEffect(() => {
    // Only auto-fill if we haven't already and we have addresses
    if (addresses.length > 0 && !isAutoFilled.current) {
      const savedAddress =
        addresses.find((address) => address.isDefault) || addresses[0];

      setForm((prev) => ({
        ...prev,
        fullName: savedAddress.name || user?.username || prev.fullName,
        phone: savedAddress.phone || prev.phone,
        address: savedAddress.street || prev.address,
        city: savedAddress.city || prev.city,
        state: savedAddress.state || prev.state,
        pincode: savedAddress.zipCode || prev.pincode,
      }));

      isAutoFilled.current = true;
    }
  }, [addresses, user?.username]);

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item.productId?.price ?? item.price ?? 0) *
        Number(item.quantity ?? 1),
    0,
  );

  const couponRequestItems = cartItems
    .map((item: any) => ({
      productId: item.productId?._id || item.productId,
      quantity: Number(item.quantity ?? 1),
    }))
    .filter((item: any) => Boolean(item.productId));

  const finalTotal = Math.max(0, subtotal - couponDiscount);

  useEffect(() => {
    let cancelled = false;

    const loadEligibleCoupons = async () => {
      if (!user?.email || subtotal <= 0 || couponRequestItems.length === 0) {
        setAvailableCoupons([]);
        return;
      }

      try {
        setEligibleCouponsLoading(true);

        const eligibleCoupons = await getEligibleCoupons(
          subtotal,
          couponRequestItems,
        );

        if (cancelled) return;

        const sortedCoupons = [...eligibleCoupons].sort(
          (a: any, b: any) =>
            Number(b.calculatedDiscount ?? b.discount ?? 0) -
            Number(a.calculatedDiscount ?? a.discount ?? 0),
        );

        setAvailableCoupons(sortedCoupons);
      } catch (error) {
        console.error("Failed to load eligible coupons:", error);

        if (!cancelled) {
          setAvailableCoupons([]);
        }
      } finally {
        if (!cancelled) {
          setEligibleCouponsLoading(false);
        }
      }
    };

    loadEligibleCoupons();

    return () => {
      cancelled = true;
    };
  }, [user?.email, subtotal, cartItems, getEligibleCoupons]);

  // ADD THE NEW EFFECT HERE
  useEffect(() => {
    if (!appliedCoupon) return;

    const couponStillEligible = availableCoupons.some(
      (coupon: any) => coupon.code === appliedCoupon.code,
    );

    if (!eligibleCouponsLoading && !couponStillEligible) {
      setCouponCode("");
      setCouponDiscount(0);
      setAppliedCoupon(null);

      toast.info(
        "The applied coupon is no longer eligible for the current cart.",
      );
    }
  }, [availableCoupons, appliedCoupon, eligibleCouponsLoading]);

  const applyCouponLogic = async (code: string) => {
    if (!code.trim()) {
      toast.warn("Please enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      const response = await validateCoupon(code, subtotal, couponRequestItems);

      if (response.success) {
        const validatedDiscount = Number(response.discount ?? 0);

        setCouponCode(code.trim().toUpperCase());
        setCouponDiscount(validatedDiscount);
        setAppliedCoupon({
          ...response.coupon,
          code: response.coupon?.code || code.trim().toUpperCase(),
          calculatedDiscount: validatedDiscount,
        });
        toast.success(
          `Coupon Applied! ₹${Math.round(response.discount)} discount`,
        );
      } else {
        toast.error(response.message || "Invalid coupon code");
        setCouponDiscount(0);
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const placeOrder = async () => {
    if (
      !form.fullName ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      toast.warn("Please fill in all shipping details");
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");

      let orderItems = cartItems.map((item: any) => ({
        productId: item.productId._id,
        name: item.productId.name,
        images: Array.isArray(item.productId?.images)
          ? item.productId.images
          : [],
        quantity: item.quantity,
        price: item.productId.price,
      }));

      if (orderItems.length === 0) {
        toast.error("No items to order");
        return;
      }

      await createOrder(
        orderItems,
        {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        form.paymentMethod,
        appliedCoupon?.code || "",
      );

      if (mode === "buynow") {
        sessionStorage.removeItem("buyNowItems");
      }

      // Clear coupon state
      setCouponCode("");
      setCouponDiscount(0);
      setAppliedCoupon(null);

      toast.success("Order placed successfully!");
      navigate("/place-order");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-10">
          {/* FORM */}
          <div className="space-y-4">
            <h2 className="font-bold text-xl mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <input
                placeholder="Full Name"
                className="w-full border p-3 rounded"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />

              <input
                placeholder="Phone"
                className="w-full border p-3 rounded"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <textarea
                placeholder="Address"
                className="w-full border p-3 rounded"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  placeholder="City"
                  className="w-full border p-3 rounded"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />

                <input
                  placeholder="State"
                  className="w-full border p-3 rounded"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>

              <input
                placeholder="Pincode"
                className="w-full border p-3 rounded"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />

              <div className="pt-4">
                <h2 className="font-bold text-xl mb-4">Payment Method</h2>
                <select
                  className="w-full border p-3 rounded bg-secondary/20"
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({ ...form, paymentMethod: e.target.value })
                  }
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                </select>
                <p className="text-sm text-muted-foreground mt-2 italic">
                  * Online payment options are currently on hold.
                </p>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="border rounded-lg p-6 h-fit sticky top-8">
            <h2 className="font-bold text-xl mb-6">Order Summary</h2>

            <div className="max-h-100 overflow-y-auto pr-2">
              {cartItems.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex justify-between items-start mb-4 gap-4"
                >
                  <div className="flex gap-3">
                    <img
                      src={
                        (Array.isArray(item.productId?.images)
                          ? item.productId.images[0]
                          : item.productId?.image) ||
                        (Array.isArray(item.images)
                          ? item.images[0]
                          : item.image) ||
                        "/placeholder.png"
                      }
                      alt={item.productId?.name || item.name || "product"}
                      className="w-12 h-12 object-contain border rounded p-1 bg-white"
                    />
                    <div>
                      <p className="font-medium text-sm line-clamp-1">
                        {item.productId.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  <span className="font-semibold">
                    ₹{(item.productId.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-6" />

            {eligibleCouponsLoading ? (
              <div className="mb-6 rounded-lg border p-4">
                <Loader text="Finding the best offers..." />
              </div>
            ) : availableCoupons.length > 0 ? (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-3">Available Offers</p>
                {availableCoupons.map((coupon: any, index: number) => (
                  <div
                    key={coupon._id}
                    className="border rounded-lg p-3 flex justify-between items-center bg-green-50 mb-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-green-700">
                          {coupon.code}
                        </p>
                        {index === 0 && (
                          <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            Best Value
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        Save ₹
                        {Number(
                          coupon.calculatedDiscount ?? coupon.discount ?? 0,
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pay only ₹
                        {Math.max(
                          0,
                          subtotal -
                            Number(
                              coupon.calculatedDiscount ?? coupon.discount ?? 0,
                            ),
                        ).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      disabled={
                        couponLoading || appliedCoupon?.code === coupon.code
                      }
                      onClick={() => applyCouponLogic(coupon.code)}
                    >
                      {appliedCoupon?.code === coupon.code
                        ? "Applied"
                        : "Apply"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mb-6 rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm font-medium">
                  No eligible offers available
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Add more products or increase the order amount to unlock
                  coupons.
                </p>
              </div>
            )}

            <div className="mb-5">
              <label className="text-sm font-medium">Apply Coupon</label>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  disabled={!!appliedCoupon}
                  placeholder="Enter Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 border rounded p-2"
                />
                <Button
                  onClick={() => applyCouponLogic(couponCode)}
                  disabled={couponLoading || !!appliedCoupon}
                >
                  {couponLoading ? (
                    <Loader text="..." variant="button" />
                  ) : (
                    "Apply"
                  )}
                </Button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between mt-2">
                  <p className="text-green-600 text-sm">
                    ✓ {appliedCoupon.code} applied
                  </p>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 text-sm font-medium hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-2 border-t">
                <span>Total</span>
                <span>₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <Button
              disabled={loading || cartItems.length === 0}
              className="w-full mt-8 py-6 text-lg"
              onClick={placeOrder}
            >
              {loading ? (
                <Loader text="Processing..." variant="button" />
              ) : (
                "Confirm Order"
              )}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-wider">
              Secure Checkout • 100% Genuine Products
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
