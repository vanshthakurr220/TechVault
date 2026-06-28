import { api } from "@/lib/api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { toast } from "react-toastify";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface User {
  _id?: string;
  username: string;
  email: string;
  mobile: string;
  role: string;
}

export interface Address {
  _id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

export interface CartItem {
  productId: any;
  name?: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  price: number;
  originalPrice?: number;
  image: string; // Keep for compatibility (primary image)
  images: string[]; // Full gallery of images
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity: number;
  description: string;
  views?: number;
  unitsSold?: number;
  revenue?: number;
  wishlistCount?: number;
  specifications?: Record<string, any>;
}

export interface Order {
  _id: string;
  items: Array<{
    productId: {
      name: string;
    };
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
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

export interface Review {
  _id: string;
  userEmail: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
}

interface AppContextType {
  sendMobileOTPSignup: (mobile: string) => Promise<void>;

  verifyMobileOTPSignup: (mobile: string, otp: string) => Promise<void>;
  // User & Auth State
  userLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  authLoading: boolean;
  theme: "light" | "dark";
  switchable: boolean;
  toggleTheme?: () => void;
  incrementProductView: (productId: string) => Promise<void>;

  // Auth Functions
  login: (email: string, password: string) => Promise<void>;
  signup: (
    username: string,
    email: string,
    password: string,
    mobile: string,
  ) => Promise<void>;
  logout: () => void;
  sendOTPSignup: (email: string) => Promise<void>;
  verifyOTPSignup: (email: string, otp: string) => Promise<void>;
  sendOTPEmailChange: (newEmail: string) => Promise<void>;
  verifyOTPEmailChange: (newEmail: string, otp: string) => Promise<void>;
  sendOTPMobileChange: (newMobile: string) => Promise<void>;
  verifyOTPMobileChange: (newMobile: string, otp: string) => Promise<void>;
  updateProfile: (username: string, mobile: string) => Promise<void>;

  // Address Functions
  addresses: Address[];
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (addressId: string, address: Address) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;

  // Cart Functions
  cartCount: number;
  cartItems: CartItem[];
  fetchCartCount: () => Promise<void>;
  fetchCart: () => Promise<void>;
  getCartItems: () => Promise<any[]>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;

  // Wishlist Functions
  wishlistCount: number;
  wishlistItems: any[];
  fetchWishlistCount: () => Promise<void>;
  fetchWishlistItems: () => Promise<void>;
  getWishlistItems: () => Promise<any[]>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isProductInWishlist: (productId: string) => Promise<boolean>;

  // Product Functions (Public)
  products: Product[];
  fetchProducts: () => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;

  // Order Functions
  orders: Order[];
  fetchOrders: () => Promise<void>;
  createOrder: (
    items: CartItem[],
    shippingAddress: any,
    paymentMethod: string,
    couponCode?: string,
    discountAmount?: number,
  ) => Promise<void>;

  // Review Functions
  reviews: Review[];
  fetchProductReviews: (productId: string) => Promise<void>;
  submitReview: (
    productId: string,
    rating: number,
    comment: string,
  ) => Promise<void>;

  // Contact Functions
  submitContact: (
    name: string,
    email: string,
    message: string,
  ) => Promise<void>;

  // Admin Functions
  allUsers: any[];
  allOrders: any[];
  allContacts: any[];
  allReviews: any[];
  allWishlists: any[];
  adminProducts: Product[]; // Renamed from allProducts for clarity
  fetchAllUsers: () => Promise<void>;
  fetchAllOrders: () => Promise<void>;
  fetchAllContacts: () => Promise<void>;
  fetchAllReviews: () => Promise<void>;
  fetchAllWishlists: () => Promise<void>;
  fetchAdminProducts: () => Promise<void>; // Renamed from fetchAllProducts
  fetchDashboardStats: () => Promise<{
    users: number;
    products: number;
    messages: number;
    orders: number;
    wishlists: number;
    reviews: number;
  }>;
  deleteUser: (userId: string) => Promise<void>;
  makeAdmin: (userId: string) => Promise<void>;
  removeAdmin: (userId: string) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  markContactAsRead: (contactId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updatePaymentStatus: (
    orderId: string,
    paymentStatus: string,
  ) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  addProduct: (product: any) => Promise<void>;
  // Admin Product Loading State
  addingProduct: boolean;
  setAddingProduct: React.Dispatch<React.SetStateAction<boolean>>;
  updateProduct: (productId: string, product: any) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  coupons: Coupon[];

  fetchCoupons: () => Promise<void>;

  createCoupon: (couponData: any) => Promise<any>;

  updateCoupon: (couponId: string, couponData: any) => Promise<any>;

  deleteCoupon: (couponId: string) => Promise<any>;

  validateCoupon: (code: string, subtotal: number) => Promise<any>;
}

const AppContext = createContext<AppContextType | null>(null);

// ============================================================================
// APP PROVIDER COMPONENT
// ============================================================================

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const switchable = false;

  // ========== USER & AUTH STATE ==========
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = switchable
    ? () => setTheme((prev) => (prev === "light" ? "dark" : "light"))
    : undefined;

  // ========== CART STATE ==========
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // ========== WISHLIST STATE ==========
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);

  // ========== PRODUCT STATE (Public) ==========
  const [products, setProducts] = useState<Product[]>([]);

  // ========== PRODUCT STATE (Admin) ==========
  const [adminProducts, setAdminProducts] = useState<Product[]>([]); // Renamed from allProducts

  // ========== ADDRESS STATE ==========
  const [addresses, setAddresses] = useState<Address[]>([]);

  // ========== ORDER STATE ==========
  const [orders, setOrders] = useState<Order[]>([]);

  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // ========== REVIEW STATE ==========
  const [reviews, setReviews] = useState<Review[]>([]);

  // ========== ADMIN STATE =========='
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [allWishlists, setAllWishlists] = useState<any[]>([]);

  // ========== Coupons FUNCTIONS ==========
  // ========== Coupons FUNCTIONS ==========
  const fetchCoupons = useCallback(async () => {
    try {
      const response = await api(`/api/coupons`);
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error("Fetch coupons error:", error);
    }
  }, []);

  const createCoupon = useCallback(
    async (couponData: any) => {
      try {
        const response = await api(`/api/coupons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponData),
        });
        const data = await response.json();
        if (data.success) {
          await fetchCoupons();
        }
        return data;
      } catch (error) {
        console.error(error);
      }
    },
    [fetchCoupons],
  );

  const updateCoupon = useCallback(
    async (couponId: string, couponData: any) => {
      try {
        const response = await api(`/api/coupons/${couponId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(couponData),
        });
        const data = await response.json();
        if (data.success) {
          await fetchCoupons();
        }
        return data;
      } catch (error) {
        console.error(error);
      }
    },
    [fetchCoupons],
  );

  const deleteCoupon = useCallback(
    async (couponId: string) => {
      try {
        const response = await api(`/api/coupons/${couponId}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          await fetchCoupons();
        }
        return data;
      } catch (error) {
        console.error(error);
      }
    },
    [fetchCoupons],
  );

  const validateCoupon = useCallback(async (code: string, subtotal: number) => {
    try {
      const response = await api(`/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      return await response.json();
    } catch (error) {
      console.error(error);
    }
  }, []);

  // ========== AUTH FUNCTIONS ==========

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      setAccessToken(data.accessToken);

      setUser(data.user);
      setUserLoggedIn(true);
      toast.success("Login successful!");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreSession = useCallback(async () => {
    setAuthLoading(true);

    try {
      const response = await api("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Session expired");
      }

      const data = await response.json();

      setAccessToken(data.accessToken);

      const meResponse = await api("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });

      if (!meResponse.ok) {
        throw new Error("Failed to fetch user");
      }

      const meData = await meResponse.json();

      setUser(meData.user);
      setUserLoggedIn(true);
    } catch (error) {
      setUser(null);
      setUserLoggedIn(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (
      username: string,
      email: string,
      password: string,
      mobile: string,
    ) => {
      setLoading(true);
      try {
        const response = await api("/api/auth/signup", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, mobile }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Signup failed");
        }

        setAccessToken(data.accessToken);

        setUser(data.user);
        setUserLoggedIn(true);

        toast.success("Account created successfully!");
      } catch (error: any) {
        toast.error(error.message || "Signup failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setAccessToken(null);
    setUser(null);
    setUserLoggedIn(false);

    setCartCount(0);
    setCartItems([]);
    setWishlistCount(0);
    setWishlistItems([]);
    setAddresses([]);
    setOrders([]);

    toast.success("Logged out successfully! See you soon 👋");
  }, []);

  const sendOTPSignup = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const response = await api("/api/auth/send-otp-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      toast.success("OTP sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTPSignup = useCallback(async (email: string, otp: string) => {
    setLoading(true);
    try {
      const response = await api("/api/auth/verify-otp-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      toast.success("Email verified successfully!");
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMobileOTPSignup = useCallback(async (mobile: string) => {
    setLoading(true);

    try {
      const response = await api("/api/auth/send-mobile-otp-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send mobile OTP");
      }

      toast.success("OTP sent to your mobile!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send mobile OTP");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyMobileOTPSignup = useCallback(
    async (mobile: string, otp: string) => {
      setLoading(true);

      try {
        const response = await api("/api/auth/verify-mobile-otp-signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile,
            otp,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "OTP verification failed");
        }

        toast.success("Mobile verified successfully!");
      } catch (error: any) {
        toast.error(error.message || "OTP verification failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const sendOTPEmailChange = useCallback(
    async (newEmail: string) => {
      setLoading(true);
      try {
        const response = await api("/api/auth/send-otp-email-change", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ newEmail }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to send OTP");
        }

        toast.success("OTP sent to your new email!");
      } catch (error: any) {
        toast.error(error.message || "Failed to send OTP");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const verifyOTPEmailChange = useCallback(
    async (newEmail: string, otp: string) => {
      setLoading(true);
      try {
        const response = await api("/api/auth/verify-otp-email-change", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ newEmail, otp }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Email verification failed");
        }

        setUser(data.user);

        toast.success("Email updated successfully!");
      } catch (error: any) {
        toast.error(error.message || "Email verification failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const sendOTPMobileChange = useCallback(
    async (newMobile: string) => {
      setLoading(true);

      try {
        const response = await api("/api/auth/send-otp-mobile-change", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ newMobile }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to send OTP");
        }

        toast.success("OTP sent to your new mobile number!");
      } catch (error: any) {
        toast.error(error.message || "Failed to send OTP");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const verifyOTPMobileChange = useCallback(
    async (newMobile: string, otp: string) => {
      setLoading(true);

      try {
        const response = await api("/api/auth/verify-otp-mobile-change", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            newMobile,
            otp,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Mobile verification failed");
        }

        setUser(data.user);

        toast.success("Mobile number updated successfully!");
      } catch (error: any) {
        toast.error(error.message || "Mobile verification failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const updateProfile = useCallback(
    async (username: string, mobile: string) => {
      setLoading(true);
      try {
        const response = await api("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username, mobile }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update profile");
        }

        setUser(data.user);

        toast.success("Profile updated successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to update profile");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  // ========== ADDRESS FUNCTIONS ==========

  const fetchAddresses = useCallback(async () => {
    if (!accessToken) return;

    try {
      const response = await api("/api/auth/addresses", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      setAddresses([]);
    }
  }, [accessToken]);

  const addAddress = useCallback(
    async (address: Address) => {
      if (!accessToken) return;

      setLoading(true);
      try {
        const response = await api("/api/auth/add-address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            address,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add address");
        }

        setAddresses(data.addresses || []);
        toast.success("Address added successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to add address");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const updateAddress = useCallback(
    async (addressId: string, address: Address) => {
      if (!accessToken) return;

      setLoading(true);

      try {
        const response = await api("/api/auth/update-address", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            addressId,
            updatedAddress: address,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update address");
        }

        setAddresses(data.addresses || []);

        toast.success("Address updated successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to update address");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const deleteAddress = useCallback(
    async (addressId: string) => {
      if (!accessToken) return;

      setLoading(true);

      try {
        const response = await api(`/api/auth/delete-address/${addressId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete address");
        }

        setAddresses(data.addresses || []);
        toast.success("Address deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete address");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const setDefaultAddress = useCallback(
    async (addressId: string) => {
      if (!accessToken) return;

      try {
        const response = await api("/api/auth/set-default-address", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ addressId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to set default address");
        }

        setAddresses(data.addresses || []);
        toast.success("Default address updated!");
      } catch (error: any) {
        toast.error(error.message || "Failed to set default address");
        throw error;
      }
    },
    [accessToken],
  );

  // ========== CART FUNCTIONS ==========

  const fetchCartCount = useCallback(async () => {
    if (!user?.email) {
      setCartCount(0);
      return;
    }

    try {
      const response = await api(`/api/cart/getUserCart/${user.email}`);
      const data = await response.json();

      const totalItems =
        data?.items?.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        ) || 0;
      setCartCount(totalItems);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  }, [user?.email]);

  const fetchCart = useCallback(async () => {
    if (!user?.email) {
      setCartItems([]);
      return;
    }

    try {
      const response = await api(`/api/cart/getUserCart/${user.email}`);
      const data = await response.json();
      setCartItems(data?.items || data?.cart?.items || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
    }
  }, [user?.email]);

  const getCartItems = useCallback(async (): Promise<any[]> => {
    if (!user?.email) {
      setCartItems([]);
      return [];
    }

    try {
      const response = await api(`/api/cart/getUserCart/${user.email}`);
      const data = await response.json();
      const items = data?.items || data?.cart?.items || [];
      setCartItems(items);
      return items;
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      return [];
    }
  }, [user?.email]);

  const addToCart = useCallback(
    async (productId: string, quantity: number) => {
      if (!user?.email) {
        toast.error("Please login to add items to cart");
        return;
      }

      setLoading(true);
      try {
        const response = await api("/api/cart/addToCart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, productId, quantity }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add to cart");
        }

        await fetchCartCount();
        await fetchCart();
        toast.success("Item added to cart!");
      } catch (error: any) {
        toast.error(error.message || "Failed to add to cart");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user?.email, fetchCartCount, fetchCart],
  );

  const updateCartQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!user?.email) return;

      try {
        const response = await api("/api/cart/updateCart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, productId, quantity }),
        });

        if (!response.ok) {
          throw new Error("Failed to update cart");
        }

        setCartItems((prev) =>
          prev.map((item: any) =>
            (item.productId?._id || item.productId) === productId
              ? { ...item, quantity }
              : item,
          ),
        );
        await fetchCart();
        await fetchCartCount();
      } catch (error: any) {
        toast.error(error.message || "Failed to update cart");
        throw error;
      }
    },
    [user?.email, fetchCart, fetchCartCount],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!user?.email) return;

      try {
        const response = await api(
          `/api/cart/removeCartItem/${user.email}/${productId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to remove from cart");
        }

        setCartItems((prev) =>
          prev.filter(
            (item: any) =>
              (item.productId?._id || item.productId) !== productId,
          ),
        );
        await fetchCart();
        await fetchCartCount();
        toast.success("Item removed from cart!");
      } catch (error: any) {
        toast.error(error.message || "Failed to remove from cart");
        throw error;
      }
    },
    [user?.email, fetchCart, fetchCartCount],
  );

  const clearCart = useCallback(async () => {
    if (!user?.email) return;

    try {
      const response = await api(`/api/cart/clearCart/${user.email}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      setCartItems([]);
      setCartCount(0);
    } catch (error: any) {
      toast.error(error.message || "Failed to clear cart");
      throw error;
    }
  }, [user?.email]);

  // ========== WISHLIST FUNCTIONS ==========

  const fetchWishlistCount = useCallback(async () => {
    if (!user?.email) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await api(`/api/wishlist/getUserWishlist/${user.email}`);
      const data = await response.json();

      const totalItems = data?.items?.length || 0;
      setWishlistCount(totalItems);
    } catch (error) {
      console.error("Error fetching wishlist count:", error);
      setWishlistCount(0);
    }
  }, [user?.email]);

  const fetchWishlistItems = useCallback(async () => {
    if (!user?.email) {
      setWishlistItems([]);
      return;
    }

    try {
      const response = await api(`/api/wishlist/getUserWishlist/${user.email}`);
      const data = await response.json();

      setWishlistItems(data?.items || data?.wishlist?.items || []);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      setWishlistItems([]);
    }
  }, [user?.email]);

  const getWishlistItems = useCallback(async (): Promise<any[]> => {
    if (!user?.email) {
      setWishlistItems([]);
      return [];
    }

    try {
      const response = await api(`/api/wishlist/getUserWishlist/${user.email}`);
      const data = await response.json();
      const items = data?.items || data?.wishlist?.items || [];
      setWishlistItems(items);
      return items;
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      setWishlistItems([]);
      return [];
    }
  }, [user?.email]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      if (!user?.email) {
        toast.error("Please login to add items to wishlist");
        return;
      }

      try {
        const response = await api("/api/wishlist/addToWishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, productId }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to wishlist");
        }

        await fetchWishlistCount();
        await fetchWishlistItems();
        toast.success("Item added to wishlist!");
      } catch (error: any) {
        toast.error(error.message || "Failed to add to wishlist");
        throw error;
      }
    },
    [user?.email, fetchWishlistCount, fetchWishlistItems],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!user?.email) return;

      try {
        const response = await api(
          `/api/wishlist/removeWishlistItem/${user.email}/${productId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to remove from wishlist");
        }

        await fetchWishlistCount();
        await fetchWishlistItems();
        toast.success("Item removed from wishlist!");
      } catch (error: any) {
        toast.error(error.message || "Failed to remove from wishlist");
        throw error;
      }
    },
    [user?.email, fetchWishlistCount, fetchWishlistItems],
  );

  const isProductInWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!user?.email) return false;

      try {
        const response = await api(
          `/api/wishlist/isProductInWishlist/${user.email}/${productId}`,
        );
        const data = await response.json();
        return data?.inWishlist || false;
      } catch (error) {
        console.error("Error checking wishlist:", error);
        return false;
      }
    },
    [user?.email],
  );

  // ========== PRODUCT FUNCTIONS (Public) ==========

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api("/api/products/getAllProducts");
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  }, []);

  const getProductById = useCallback(
    async (id: string): Promise<Product | null> => {
      try {
        const response = await api(`/api/products/getProduct/${id}`);
        const data = await response.json();
        return data || null;
      } catch (error) {
        console.error("Error fetching product:", error);
        return null;
      }
    },
    [],
  );

  // ========== ORDER FUNCTIONS ==========

  const fetchOrders = useCallback(async () => {
    if (!user?.email) {
      setOrders([]);
      return;
    }

    try {
      const response = await api(`/api/orders/order/user/${user.email}`);
      const data = await response.json();

      if (Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    }
  }, [user?.email]);

  const createOrder = useCallback(
    async (
      items: CartItem[],
      shippingAddress: any,
      paymentMethod: string,
      couponCode: string = "",
      couponDiscount: number = 0,
    ) => {
      if (!user?.email) {
        toast.error("Please login to place an order");
        return;
      }

      setLoading(true);

      try {
        const orderItems = items.map((item: any) => ({
          productId: item.productId?._id || item.productId,
          name: item.name || item.productId?.name,
          images: item.images || item.productId?.images || [],
          price: item.price || item.productId?.price,
          quantity: item.quantity,
        }));

        const subtotal = orderItems.reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0,
        );

        const totalAmount = subtotal - couponDiscount;

        const response = await api("/api/orders/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            items: orderItems,

            shippingAddress,
            paymentMethod: paymentMethod.toLowerCase(),

            subtotal,
            couponCode,
            couponDiscount,
            totalAmount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create order");
        }

        await clearCart();
        await fetchOrders();

        toast.success("Order placed successfully!");

        if (!response.ok) {
          throw new Error(data.message || "Failed to create order");
        }

        // Save latest order
        sessionStorage.setItem("latestOrder", JSON.stringify(data.order));

        await clearCart();
        await fetchOrders();
      } catch (error: any) {
        toast.error(error.message || "Failed to create order");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user?.email, clearCart, fetchOrders],
  );

  // ========== REVIEW FUNCTIONS ==========

  const fetchProductReviews = useCallback(async (productId: string) => {
    try {
      const response = await api(`/api/reviews/product/${productId}`);
      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    }
  }, []);

  const submitReview = useCallback(
    async (productId: string, rating: number, comment: string) => {
      if (!user?.email) {
        toast.error("Please login to submit a review");
        return;
      }

      setLoading(true);
      try {
        const response = await api("/api/reviews/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            productId,
            rating,
            comment,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to submit review");
        }

        await fetchProductReviews(productId);
        toast.success("Review submitted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to submit review");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user?.email, fetchProductReviews],
  );

  // ========== CONTACT FUNCTIONS ==========

  const submitContact = useCallback(
    async (name: string, email: string, message: string) => {
      setLoading(true);
      try {
        const response = await api("/api/contact/createContact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, message }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to submit contact");
        }

        toast.success("Message sent successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to submit contact");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ========== ADMIN FUNCTIONS ==========

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api("/api/admin/getAllUsers");
      const data = await response.json();
      setAllUsers(data.users || data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    }
  }, []);

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await api("/api/admin/orders/fetchAllOrders");
      const data = await response.json();
      setAllOrders(data.orders || data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAllOrders([]);
    }
  }, []);

  const fetchAllContacts = useCallback(async () => {
    try {
      const response = await api("/api/admin/getAllContacts");
      const data = await response.json();
      setAllContacts(data.contacts || data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setAllContacts([]);
    }
  }, []);

  const fetchAllReviews = useCallback(async () => {
    try {
      const response = await api("/api/admin/getAllReviews");
      const data = await response.json();
      setAllReviews(data.reviews || data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setAllReviews([]);
    }
  }, []);

  const fetchAllWishlists = useCallback(async () => {
    try {
      const response = await api("/api/admin/getAllWishlists");
      const data = await response.json();
      setAllWishlists(data.wishlists || data || []);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      setAllWishlists([]);
    }
  }, []);

  const fetchAdminProducts = useCallback(async () => {
    // Renamed from fetchAllProducts
    try {
      const response = await api("/api/admin/getAllProducts");
      const data = await response.json();
      setAdminProducts(data.products || data || []); // Updated to setAdminProducts
    } catch (error) {
      console.error("Error fetching admin products:", error);
      setAdminProducts([]);
    }
  }, []);

  const incrementProductView = useCallback(async (productId: string) => {
    try {
      await api(`/api/products/products/${productId}/view`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("View count update failed:", error);
    }
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    const [
      usersRes,
      productsRes,
      messagesRes,
      ordersRes,
      wishlistsRes,
      reviewsRes,
    ] = await Promise.all([
      api("/api/admin/getAllUsers"),
      api("/api/admin/getAllProducts"),
      api("/api/admin/getAllContacts"),
      api("/api/admin/orders/fetchAllOrders"),
      api("/api/admin/getAllWishlists"),
      api("/api/admin/getAllReviews"),
    ]);

    const usersData = await usersRes.json();
    const productsData = await productsRes.json();
    const messagesData = await messagesRes.json();
    const ordersData = await ordersRes.json();
    const wishlistsData = await wishlistsRes.json();
    const reviewsData = await reviewsRes.json();

    const users = usersData.users || usersData || [];
    const products = productsData.products || productsData || [];
    const messages = messagesData.contacts || messagesData || [];
    const orders = ordersData.orders || ordersData || [];
    const wishlists = wishlistsData.wishlists || wishlistsData || [];
    const reviews = reviewsData.reviews || reviewsData || [];

    setAllUsers(users);
    setAdminProducts(products);
    setAllContacts(messages);
    setAllOrders(orders);
    setAllWishlists(wishlists);
    setAllReviews(reviews);

    return {
      users: users.length || usersData.count || 0,
      products: products.length || 0,
      messages: messages.length || 0,
      orders: orders.length || 0,
      wishlists: wishlists.length || 0,
      reviews: reviews.length || 0,
    };
  }, []);

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        const response = await api(`/api/admin/deleteUser/${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        await fetchAllUsers();
        toast.success("User deleted successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete user");
        throw error;
      }
    },
    [fetchAllUsers],
  );

  const makeAdmin = useCallback(
    async (userId: string) => {
      try {
        const response = await api(`/api/admin/user/${userId}/make-admin`, {
          method: "PUT",
        });

        if (!response.ok) {
          throw new Error("Failed to make admin");
        }

        await fetchAllUsers();
        toast.success("User promoted to admin!");
      } catch (error: any) {
        toast.error(error.message || "Failed to make admin");
        throw error;
      }
    },
    [fetchAllUsers],
  );

  const removeAdmin = useCallback(
    async (userId: string) => {
      try {
        const response = await api(`/api/admin/user/${userId}/remove-admin`, {
          method: "PUT",
        });

        if (!response.ok) {
          throw new Error("Failed to remove admin");
        }

        await fetchAllUsers();
        toast.success("Admin privileges removed!");
      } catch (error: any) {
        toast.error(error.message || "Failed to remove admin");
        throw error;
      }
    },
    [fetchAllUsers],
  );

  const deleteContact = useCallback(
    async (contactId: string) => {
      try {
        const response = await api(`/api/admin/deleteContact/${contactId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete contact");
        }

        await fetchAllContacts();
        toast.success("Contact deleted!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete contact");
        throw error;
      }
    },
    [fetchAllContacts],
  );

  const markContactAsRead = useCallback(
    async (contactId: string) => {
      try {
        const response = await api(
          `/api/admin/marksReadContact/${contactId}/read`,
          {
            method: "PUT",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to mark as read");
        }

        await fetchAllContacts();
      } catch (error: any) {
        console.error("Error marking contact as read:", error);
        throw error;
      }
    },
    [fetchAllContacts],
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: string) => {
      try {
        const response = await api("/api/admin/orders/changeStatusOrder", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: orderId, status }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order status");
        }

        await fetchAllOrders();
        toast.success("Order status updated!");
      } catch (error: any) {
        toast.error(error.message || "Failed to update order status");
        throw error;
      }
    },
    [fetchAllOrders],
  );

  const updatePaymentStatus = useCallback(
    async (orderId: string, paymentStatus: string) => {
      try {
        const response = await api(
          "/api/admin/orders/changePaymentStatusOrder",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: orderId, paymentStatus }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update payment status");
        }

        await fetchAllOrders();
        toast.success("Payment status updated!");
      } catch (error: any) {
        toast.error(error.message || "Failed to update payment status");
        throw error;
      }
    },
    [fetchAllOrders],
  );

  const deleteOrder = useCallback(
    async (orderId: string) => {
      try {
        const response = await api(`/api/admin/orders/${orderId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete order");
        }

        await fetchAllOrders();
        toast.success("Order deleted!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete order");
        throw error;
      }
    },
    [fetchAllOrders],
  );

  const [addingProduct, setAddingProduct] = useState(false);

  const addProduct = useCallback(
    async (productData: any) => {
      setAddingProduct(true);

      try {
        const payload = {
          ...productData,
          images: Array.isArray(productData.images)
            ? productData.images
            : [productData.image].filter(Boolean),
        };

        const response = await api("/api/admin/addProduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        toast.success("Product added successfully!");
        await fetchAdminProducts();
      } catch (error: any) {
        toast.error(error.message);
        throw error;
      } finally {
        setAddingProduct(false);
      }
    },
    [accessToken, fetchAdminProducts],
  );

  const updateProduct = useCallback(
    async (productId: string, productData: any) => {
      try {
        const payload = {
          ...productData,
          images: Array.isArray(productData.images)
            ? productData.images
            : [productData.image].filter(Boolean),
        };

        const response = await api(`/api/admin/updateProduct/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        toast.success("Product updated successfully!");
        await fetchAdminProducts();
      } catch (error: any) {
        toast.error(error.message);
        throw error;
      }
    },
    [accessToken, fetchAdminProducts],
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        const response = await api(`/api/admin/deleteProduct/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete product");
        }

        await fetchAdminProducts(); // Updated to fetchAdminProducts
        toast.success("Product deleted!");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete product");
        throw error;
      }
    },
    [fetchAdminProducts],
  ); // Updated dependency

  // ========== INITIAL EFFECTS ==========

  useEffect(() => {
    if (userLoggedIn) {
      fetchCartCount();
      fetchWishlistCount();
      fetchAddresses();
    }
  }, [userLoggedIn, fetchCartCount, fetchWishlistCount, fetchAddresses]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ========== CONTEXT VALUE ==========

  const value: AppContextType = {
    sendMobileOTPSignup,
    verifyMobileOTPSignup,
    incrementProductView,
    authLoading,
    userLoggedIn,
    user,
    loading,
    theme,
    switchable,
    toggleTheme,
    login,
    signup,
    logout,
    sendOTPSignup,
    verifyOTPSignup,
    sendOTPEmailChange,
    verifyOTPEmailChange,
    sendOTPMobileChange,
    verifyOTPMobileChange,
    updateProfile,
    addresses,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    cartCount,
    cartItems,
    fetchCartCount,
    fetchCart,
    getCartItems,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    wishlistCount,
    wishlistItems,
    fetchWishlistCount,
    fetchWishlistItems,
    getWishlistItems,
    addToWishlist,
    removeFromWishlist,
    isProductInWishlist,
    products,
    adminProducts,
    fetchProducts,
    getProductById,
    orders,
    fetchOrders,
    createOrder,
    reviews,
    fetchProductReviews,
    submitReview,
    submitContact,
    allUsers,
    allOrders,
    allContacts,
    allReviews,
    allWishlists,
    fetchAllUsers,
    fetchAllOrders,
    fetchAllContacts,
    fetchAllReviews,
    fetchAllWishlists,
    fetchAdminProducts,
    fetchDashboardStats,
    deleteUser,
    makeAdmin,
    removeAdmin,
    deleteContact,
    markContactAsRead,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    addProduct,
    addingProduct,
    setAddingProduct,

    updateProduct,
    deleteProduct,

    coupons,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useApp = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
};
