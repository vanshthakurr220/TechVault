import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  LogOut,
  Edit2,
  Save,
  MapPin,
  Plus,
  Trash2,
  Package,
  ArrowRight,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";

interface OrderItem {
  productId: {
    name: string;
  };
}

interface Order {
  _id: string;
  items: OrderItem[];
  name: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function ProfileWithOTP() {
  const [, setLocation] = useLocation();
  const {
    user,
    logout,
    addresses,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    orders,
    fetchOrders,
    updateProfile,
    sendOTPEmailChange,
    verifyOTPEmailChange,
    sendOTPMobileChange,
    verifyOTPMobileChange,
    loading,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    isDefault: false,
  });

  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Email change OTP states
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [emailChangeStep, setEmailChangeStep] = useState<"new-email" | "otp">(
    "new-email",
  );
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailChangeErrors, setEmailChangeErrors] = useState<
    Record<string, string>
  >({});

  // Mobile Change OTP states
  const [showMobileChangeModal, setShowMobileChangeModal] = useState(false);

  const [mobileChangeStep, setMobileChangeStep] = useState<
    "new-mobile" | "otp"
  >("new-mobile");

  const [newMobile, setNewMobile] = useState("");

  const [mobileOtp, setMobileOtp] = useState("");

  const [mobileChangeErrors, setMobileChangeErrors] = useState<
    Record<string, string>
  >({});

  const [formData, setFormData] = useState({
    username: user?.username || "User",
    email: user?.email || "",
    phone: user?.mobile || "",
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetchAddresses();
      fetchRecentOrders();
    }
  }, [user?.email]);

  useEffect(() => {
    const sorted = [...(orders as any[])].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setRecentOrders(sorted.slice(0, 2));
  }, [orders]);

  const fetchRecentOrders = async () => {
    try {
      await fetchOrders();
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData.username, formData.phone);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Email change OTP handlers
  const handleSendEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newEmail) newErrors.newEmail = "New email is required";
    if (!newEmail.includes("@"))
      newErrors.newEmail = "Please enter a valid email";
    if (newEmail === user?.email)
      newErrors.newEmail = "New email must be different from current email";

    if (Object.keys(newErrors).length > 0) {
      setEmailChangeErrors(newErrors);
      return;
    }

    try {
      await sendOTPEmailChange(newEmail);
      setEmailChangeStep("otp");
      setEmailChangeErrors({});
    } catch (error) {
      setEmailChangeErrors({ newEmail: "Failed to send OTP" });
    }
  };

  const handleVerifyEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!emailOtp) newErrors.emailOtp = "OTP is required";
    if (emailOtp.length !== 6) newErrors.emailOtp = "OTP must be 6 digits";

    if (Object.keys(newErrors).length > 0) {
      setEmailChangeErrors(newErrors);
      return;
    }

    try {
      await verifyOTPEmailChange(newEmail, emailOtp);

      setFormData((prev) => ({
        ...prev,
        email: newEmail,
      }));

      setShowEmailChangeModal(false);
      setNewEmail("");
      setEmailOtp("");
      setEmailChangeStep("new-email");
      setEmailChangeErrors({});
    } catch (error) {
      setEmailChangeErrors({ emailOtp: "Invalid OTP" });
    }
  };

  const handleResendEmailOTP = async () => {
    try {
      await sendOTPEmailChange(newEmail);
      setEmailOtp("");
    } catch (error) {
      setEmailChangeErrors({ newEmail: "Failed to resend OTP" });
    }
  };

  // Mobile change OTP handler
  const handleSendMobileOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!newMobile) newErrors.newMobile = "New mobile number is required";

    if (!/^\d{10}$/.test(newMobile))
      newErrors.newMobile = "Please enter a valid 10-digit mobile number";

    if (newMobile === user?.mobile)
      newErrors.newMobile =
        "New mobile number must be different from current mobile";

    if (Object.keys(newErrors).length > 0) {
      setMobileChangeErrors(newErrors);
      return;
    }

    try {
      await sendOTPMobileChange(newMobile);

      setMobileChangeStep("otp");
      setMobileChangeErrors({});
    } catch (error) {
      setMobileChangeErrors({
        newMobile: "Failed to send OTP",
      });
    }
  };

  const handleVerifyMobileOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!mobileOtp) newErrors.mobileOtp = "OTP is required";

    if (mobileOtp.length !== 6) newErrors.mobileOtp = "OTP must be 6 digits";

    if (Object.keys(newErrors).length > 0) {
      setMobileChangeErrors(newErrors);
      return;
    }

    try {
      await verifyOTPMobileChange(newMobile, mobileOtp);

      setFormData((prev) => ({
        ...prev,
        phone: newMobile,
      }));

      setShowMobileChangeModal(false);
      setNewMobile("");
      setMobileOtp("");
      setMobileChangeStep("new-mobile");
      setMobileChangeErrors({});
    } catch (error) {
      setMobileChangeErrors({
        mobileOtp: "Invalid OTP",
      });
    }
  };

  const handleResendMobileOTP = async () => {
    try {
      await sendOTPMobileChange(newMobile);
      setMobileOtp("");
    } catch (error) {
      setMobileChangeErrors({
        newMobile: "Failed to resend OTP",
      });
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, newAddress);
      } else {
        await addAddress(newAddress);
      }

      setShowAddressForm(false);
      setEditingAddressId(null);

      setNewAddress({
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        isDefault: false,
      });
    } catch (error) {
      console.error("Error saving address:", error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const result = await Swal.fire({
      title: "Delete Address",
      text: "Are you sure you want to delete this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteAddress(addressId);
      } catch (error) {
        console.error("Error deleting address:", error);
      }
    }
  };

  const handleEditAddress = (address: any) => {
    setEditingAddressId(address._id!);

    setNewAddress({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phone: address.phone,
      isDefault: address.isDefault,
    });

    setShowAddressForm(true);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold monospace">My Profile</h1>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </Button>
        </div>

        {/* Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold monospace">
                  Account Information
                </h2>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "destructive" : "default"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <X size={16} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 size={16} />
                      Edit
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-bold monospace mb-2">
                    <User className="inline mr-2" size={16} />
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-foreground">{formData.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold monospace mb-2">
                    <Mail className="inline mr-2" size={16} />
                    Email Address
                  </label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <p className="text-foreground">{formData.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Email changes require verification
                      </p>
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => setShowEmailChangeModal(true)}
                        size="sm"
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        Change Email
                      </Button>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold monospace mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <p className="text-foreground">{formData.phone}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mobile number changes require OTP verification
                        </p>
                      </div>

                      {!isEditing && (
                        <Button
                          onClick={() => setShowMobileChangeModal(true)}
                          size="sm"
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          Change Mobile
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full flex items-center gap-2 mt-4"
                  >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-card border border-border rounded-lg p-6 mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold monospace">
                  <MapPin className="inline mr-2" size={20} />
                  Addresses
                </h2>
                <Button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Address
                </Button>
              </div>

              {/* Add/Edit Address Form */}
              {showAddressForm && (
                <div className="bg-secondary/50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-bold mb-4">
                    {editingAddressId ? "Update Address" : "Add Address"}
                  </h3>

                  <form
                    onSubmit={handleAddAddress}
                    className="bg-secondary/50 p-4 rounded-lg mb-6 space-y-3"
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="text"
                      name="street"
                      placeholder="Street Address"
                      value={newAddress.street}
                      onChange={handleAddressChange}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="zipCode"
                        placeholder="Zip Code"
                        value={newAddress.zipCode}
                        onChange={handleAddressChange}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={newAddress.phone}
                        onChange={handleAddressChange}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            isDefault: e.target.checked,
                          })
                        }
                      />
                      Set as default address
                    </label>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="flex-1">
                        {editingAddressId ? "Update Address" : "Save Address"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddressForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Addresses List */}
              <div className="space-y-3">
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 rounded-lg border-2 ${
                        address.isDefault
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{address.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.street}, {address.city}, {address.state}{" "}
                            {address.zipCode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.phone}
                          </p>
                          {address.isDefault && (
                            <span className="inline-block mt-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {!address.isDefault && (
                            <Button
                              onClick={() =>
                                handleSetDefaultAddress(address._id!)
                              }
                              size="sm"
                              variant="outline"
                            >
                              Set Default
                            </Button>
                          )}

                          <Button
                            onClick={() => handleEditAddress(address)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit2 size={14} />
                          </Button>

                          <Button
                            onClick={() => handleDeleteAddress(address._id!)}
                            size="sm"
                            variant="destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No addresses yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders Sidebar */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-2xl font-bold monospace mb-4 flex items-center gap-2">
              <Package size={20} />
              Recent Orders
            </h2>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all"
                  >
                    {/* Date */}
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>

                    {/* Product Names */}
                    <h3 className="font-semibold text-base text-foreground line-clamp-2">
                      {order.items
                        ?.map((item) => item.productId?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </h3>

                    <div className="flex items-center justify-between mt-3">
                      {/* Amount */}
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="text-lg font-bold text-primary">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                      </div>

                      {/* Status */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "processing"
                                ? "bg-amber-100 text-amber-700"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No orders yet
              </p>
            )}
          </div>
        </div>

        {/* Email Change Modal */}
        {showEmailChangeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold monospace">Change Email</h3>
                <button
                  onClick={() => {
                    setShowEmailChangeModal(false);
                    setEmailChangeStep("new-email");
                    setNewEmail("");
                    setEmailOtp("");
                    setEmailChangeErrors({});
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {emailChangeStep === "new-email" ? (
                <form onSubmit={handleSendEmailOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold monospace mb-2">
                      New Email
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => {
                        setNewEmail(e.target.value);
                        setEmailChangeErrors({});
                      }}
                      placeholder="newemail@example.com"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {emailChangeErrors.newEmail && (
                      <p className="text-red-600 text-xs mt-1">
                        {emailChangeErrors.newEmail}
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold monospace mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={emailOtp}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setEmailOtp(value);
                        setEmailChangeErrors({});
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-bold"
                    />
                    {emailChangeErrors.emailOtp && (
                      <p className="text-red-600 text-xs mt-1">
                        {emailChangeErrors.emailOtp}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || emailOtp.length !== 6}
                    className="w-full"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendEmailOTP}
                    disabled={loading}
                    className="w-full"
                  >
                    Resend OTP
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEmailChangeStep("new-email");
                      setEmailOtp("");
                    }}
                    className="w-full"
                  >
                    Back
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Mobile Change Modal */}
        {showMobileChangeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold monospace">
                  Change Mobile Number
                </h3>

                <button
                  onClick={() => {
                    setShowMobileChangeModal(false);
                    setMobileChangeStep("new-mobile");
                    setNewMobile("");
                    setMobileOtp("");
                    setMobileChangeErrors({});
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {mobileChangeStep === "new-mobile" ? (
                <form onSubmit={handleSendMobileOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold monospace mb-2">
                      New Mobile Number
                    </label>

                    <input
                      type="tel"
                      value={newMobile}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        setNewMobile(value);
                        setMobileChangeErrors({});
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {mobileChangeErrors.newMobile && (
                      <p className="text-red-600 text-xs mt-1">
                        {mobileChangeErrors.newMobile}
                      </p>
                    )}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyMobileOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold monospace mb-2">
                      Verification Code
                    </label>

                    <input
                      type="text"
                      value={mobileOtp}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);

                        setMobileOtp(value);
                        setMobileChangeErrors({});
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-bold"
                    />

                    {mobileChangeErrors.mobileOtp && (
                      <p className="text-red-600 text-xs mt-1">
                        {mobileChangeErrors.mobileOtp}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || mobileOtp.length !== 6}
                    className="w-full"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendMobileOTP}
                    disabled={loading}
                    className="w-full"
                  >
                    Resend OTP
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setMobileChangeStep("new-mobile");
                      setMobileOtp("");
                    }}
                    className="w-full"
                  >
                    Back
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
