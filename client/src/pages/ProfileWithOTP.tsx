import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  LogOut,
  Edit2,
  Save,
  MapPin,
  CreditCard as PaymentIcon,
  Plus,
  Trash2,
  Package,
  X,
  Lock,
  EyeOff,
  Eye,
  ArrowRight,
} from "lucide-react";
import Swal from "sweetalert2";
import { Link, useLocation } from "wouter";
import { useApp } from "@/contexts/AppContext";
import Loader from "@/components/Loader";
import { navigate } from "wouter/use-browser-location";

interface OrderItem {
  productId?: {
    _id: string;
    name?: string;
    images?: string[];
    image?: string;
  };

  name?: string;
  images?: string[];
  image?: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: string;
  couponCode?: string;
  couponDiscount?: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
}

export default function ProfileWithOTP() {
  const [, setLocation] = useLocation();
  const {
    user,
    logout,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    orders,
    updateProfile,
    changePassword,
    sendOTPEmailChange,
    verifyOTPEmailChange,
    sendOTPMobileChange,
    verifyOTPMobileChange,
    loading,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

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
    const sorted = [...(orders as any[])].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    setRecentOrders(sorted.slice(0, 2));
  }, [orders]);

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
      await updateProfile(formData.username);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });

    setPasswordErrors({});
  };

  const togglePasswordVisibility = (
    field: "oldPassword" | "newPassword" | "confirmNewPassword",
  ) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!passwordData.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
    }

    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Confirm password is required";
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match";
    }

    if (
      passwordData.oldPassword &&
      passwordData.newPassword &&
      passwordData.oldPassword === passwordData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    try {
      await changePassword(
        passwordData.oldPassword,
        passwordData.newPassword,
        passwordData.confirmNewPassword,
      );

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setPasswordErrors({});
      setShowPasswordChangeModal(false);
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

  const resetAddressForm = () => {
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
            className="flex items-center gap-2 font-bold"
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
                  className="flex items-center gap-2 font-bold"
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
                        className="whitespace-nowrap hover:bg-black hover:text-white hover:border-black font-bold"
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
                        className="whitespace-nowrap hover:bg-black hover:text-white hover:border-black font-bold"
                      >
                        Change Mobile
                      </Button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full flex items-center gap-2 mt-4 font-bold"
                  >
                    <Save size={16} />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold monospace flex items-center gap-2">
                    <Lock size={20} />
                    Password
                  </h2>

                  <p className="text-sm text-muted-foreground mt-1">
                    Your password is securely encrypted. Change it anytime for
                    better account security.
                  </p>
                </div>

                <Button
                  onClick={() => setShowPasswordChangeModal(true)}
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto hover:bg-black hover:text-white hover:border-black font-bold"
                >
                  Change Password
                </Button>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold monospace flex items-center gap-2">
                  <MapPin size={20} />
                  Addresses
                </h2>

                <Button
                  onClick={() => {
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
                    setShowAddressForm(true);
                  }}
                  size="sm"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 font-bold"
                >
                  <Plus size={16} />
                  Add Address
                </Button>
              </div>

              <div className="space-y-3">
                {addresses.length > 0 ? (
                  addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 rounded-xl border ${
                        address.isDefault
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-base wrap-break-words">
                            {address.name}
                          </p>

                          <p className="text-sm text-muted-foreground mt-1 wrap-break-words leading-relaxed">
                            {address.street}, {address.city}, {address.state}{" "}
                            {address.zipCode}
                          </p>

                          <p className="text-sm text-muted-foreground mt-1">
                            {address.phone}
                          </p>

                          {address.isDefault && (
                            <span className="inline-block mt-3 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md font-semibold">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:justify-end">
                          {!address.isDefault && (
                            <Button
                              onClick={() =>
                                handleSetDefaultAddress(address._id!)
                              }
                              size="sm"
                              variant="outline"
                              className="font-bold flex-1 sm:flex-none hover:bg-black hover:text-white hover:border-black"
                            >
                              Set Default
                            </Button>
                          )}

                          <Button
                            onClick={() => handleEditAddress(address)}
                            size="sm"
                            variant="outline"
                            className="font-bold flex-1 sm:flex-none hover:bg-black hover:text-white hover:border-black"
                          >
                            <Edit2 size={14} />
                            <span className="sm:hidden ml-1">Edit</span>
                          </Button>

                          <Button
                            onClick={() => handleDeleteAddress(address._id!)}
                            size="sm"
                            variant="destructive"
                            className="flex-1 sm:flex-none"
                          >
                            <Trash2 size={14} />
                            <span className="sm:hidden ml-1">Delete</span>
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
            <div className="flex items-center justify-between mb-4 gap-4">
              <h2 className="text-2xl font-bold monospace flex items-center gap-2">
                <Package size={20} />
                Recent Orders
              </h2>

              <Link href="/orders">
                <Button
                  variant="outline"
                  className="font-bold rounded-xl hover:bg-primary hover:text-primary-foreground"
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className="group p-4 rounded-xl border border-border bg-card cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
                  >
                    {/* Date */}
                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    {/* Clickable Product Names */}
                    <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
                      {order.items?.map((item, index) => {
                        const productId = item.productId?._id;
                        const productName =
                          item.productId?.name || item.name || "Product";

                        return (
                          <span
                            key={productId || index}
                            className="flex items-center"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();

                                if (productId) {
                                  navigate(`/product/${productId}`);
                                }
                              }}
                              className="text-left font-semibold text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
                            >
                              {productName}
                            </button>

                            {index < order.items.length - 1 && (
                              <span className="mr-1 text-muted-foreground">
                                ,
                              </span>
                            )}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between mt-3 gap-4">
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

                    <p className="mt-3 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                      Click anywhere on the card to view order details
                    </p>
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
                    {loading ? (
                      <Loader text="Sending OTP" variant="button" />
                    ) : (
                      "Send OTP"
                    )}
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
                    {loading ? (
                      <Loader text="Verifying" variant="button" />
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendEmailOTP}
                    disabled={loading}
                    className="w-full font-bold"
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
                    className="w-full font-bold"
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
                  className="text-muted-foreground hover:text-foreground font-bold"
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold"
                  >
                    {loading ? (
                      <Loader text="Sending OTP" variant="button" />
                    ) : (
                      "Send OTP"
                    )}
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
                    className="w-full font-bold"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendMobileOTP}
                    disabled={loading}
                    className="w-full font-bold"
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
                    className="w-full font-bold"
                  >
                    Back
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordChangeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-4 sm:p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold monospace flex items-center gap-2">
                  <Lock size={20} />
                  Change Password
                </h3>

                <button
                  onClick={() => {
                    setShowPasswordChangeModal(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      confirmNewPassword: "",
                    });
                    setPasswordErrors({});
                  }}
                  className="text-muted-foreground hover:text-foreground font-bold"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  {
                    label: "Current Password",
                    name: "oldPassword" as const,
                    value: passwordData.oldPassword,
                    error: passwordErrors.oldPassword,
                    show: showPasswords.oldPassword,
                  },
                  {
                    label: "New Password",
                    name: "newPassword" as const,
                    value: passwordData.newPassword,
                    error: passwordErrors.newPassword,
                    show: showPasswords.newPassword,
                  },
                  {
                    label: "Confirm New Password",
                    name: "confirmNewPassword" as const,
                    value: passwordData.confirmNewPassword,
                    error: passwordErrors.confirmNewPassword,
                    show: showPasswords.confirmNewPassword,
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-bold monospace mb-2">
                      {field.label}
                    </label>

                    <div className="relative">
                      <input
                        type={field.show ? "text" : "password"}
                        name={field.name}
                        value={field.value}
                        onChange={handlePasswordChange}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full px-4 py-2 pr-11 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />

                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.name)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground font-bold"
                      >
                        {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {field.error && (
                      <p className="text-red-600 text-xs mt-1">{field.error}</p>
                    )}
                  </div>
                ))}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-bold"
                >
                  <Lock size={16} />
                  {loading ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Address Add/Edit Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold monospace flex items-center gap-2">
                  <MapPin size={20} />
                  {editingAddressId ? "Edit Address" : "Add Address"}
                </h3>

                <button
                  onClick={() => {
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
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddAddress} className="space-y-4">
                <input
                  name="name"
                  value={newAddress.name}
                  onChange={handleAddressChange}
                  placeholder="Full Name"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <input
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleAddressChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <input
                  name="street"
                  value={newAddress.street}
                  onChange={handleAddressChange}
                  placeholder="Street Address"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    name="city"
                    value={newAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />

                  <input
                    name="state"
                    value={newAddress.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <input
                  name="zipCode"
                  value={newAddress.zipCode}
                  onChange={handleAddressChange}
                  placeholder="Zip Code"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 font-bold"
                  >
                    {loading
                      ? editingAddressId
                        ? "Updating..."
                        : "Saving..."
                      : editingAddressId
                        ? "Update Address"
                        : "Save Address"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
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
                    }}
                    className="w-full sm:flex-1 hover:bg-black hover:text-white hover:border-black"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Order Details
                </p>

                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-900 hover:text-white font-bold"
                aria-label="Close order details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8 p-4 sm:p-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Order Date
                  </p>

                  <p className="text-sm font-bold text-slate-900">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Total Amount
                  </p>

                  <p className="text-sm font-bold text-slate-900 sm:text-base">
                    ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Payment
                  </p>

                  <p className="text-sm font-bold uppercase text-slate-900">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Status
                  </p>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      selectedOrder.status === "delivered"
                        ? "bg-emerald-100 text-emerald-700"
                        : selectedOrder.status === "shipped"
                          ? "bg-violet-100 text-violet-700"
                          : selectedOrder.status === "processing"
                            ? "bg-sky-100 text-sky-700"
                            : selectedOrder.status === "cancelled"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {/* Ordered Products */}
                <div className="space-y-4 lg:col-span-2">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900">
                    <Package size={18} className="text-primary" />
                    Ordered Products
                  </h3>

                  {selectedOrder.items.map((item, index) => {
                    const productId = item.productId?._id;

                    const productName =
                      item.productId?.name || item.name || "Product";

                    const productImage =
                      item.images?.[0] ||
                      item.productId?.images?.[0] ||
                      item.image ||
                      item.productId?.image ||
                      "/placeholder.png";

                    return (
                      <div
                        key={productId || index}
                        className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-3 sm:p-4"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (productId) {
                              navigate(`/product/${productId}`);
                            }
                          }}
                          className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white sm:h-24 sm:w-24 font-bold"
                        >
                          <img
                            src={productImage}
                            alt={productName}
                            className="h-full w-full object-contain p-2 transition-transform duration-300 hover:scale-110"
                          />
                        </button>

                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (productId) {
                                navigate(`/product/${productId}`);
                              }
                            }}
                            className="line-clamp-2 text-left font-bold text-slate-900 transition-colors hover:text-primary hover:underline"
                          >
                            {productName}
                          </button>

                          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                            <div>
                              <p className="text-xs text-slate-500">
                                Quantity: {item.quantity}
                              </p>

                              <p className="text-xs text-slate-500">
                                ₹{item.price.toLocaleString("en-IN")} each
                              </p>
                            </div>

                            <p className="font-bold text-slate-900">
                              ₹
                              {(item.price * item.quantity).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="font-medium text-slate-500">
                      Grand Total
                    </span>

                    <span className="text-xl font-black text-slate-900">
                      ₹{selectedOrder.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Address and Payment */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <MapPin size={15} />
                      Shipping Address
                    </h3>

                    <div className="space-y-1 text-sm">
                      <p className="font-bold text-slate-900">
                        {selectedOrder.shippingAddress.fullName}
                      </p>

                      <p className="text-slate-600">
                        {selectedOrder.shippingAddress.phone}
                      </p>

                      <p className="leading-relaxed text-slate-600">
                        {selectedOrder.shippingAddress.address}
                      </p>

                      <p className="text-slate-600">
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state} -{" "}
                        {selectedOrder.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <PaymentIcon size={15} />
                      Payment Details
                    </h3>

                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">Method</span>

                      <span className="text-sm font-bold uppercase text-slate-900">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">Status</span>

                      <span
                        className={`rounded-md px-2 py-1 text-xs font-bold uppercase ${
                          selectedOrder.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : selectedOrder.paymentStatus === "failed"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {selectedOrder.couponCode && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-700">
                        Coupon Applied
                      </p>

                      <div className="flex items-center justify-between gap-3">
                        <span className="font-black text-emerald-800">
                          {selectedOrder.couponCode}
                        </span>

                        <span className="font-bold text-emerald-700">
                          -₹
                          {selectedOrder.couponDiscount?.toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
