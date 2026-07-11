import { useNotification } from "@/components/Notification";
import { api } from "@/lib/api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";

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

export interface ProductQuestion {
  _id: string;

  productId:
    | string
    | {
        _id: string;
        name: string;
        image?: string;
        images?: string[];
        category?: string;
      };

  userId: {
    _id: string;
    username: string;
    email?: string;
  };

  question: string;

  answer?: string;

  status: "pending" | "answered";

  createdAt: string;
  updatedAt?: string;

  answeredAt?: string;

  answeredBy?: {
    _id: string;
    username: string;
    email?: string;
  };

  likes: string[];
  dislikes: string[];

  likesCount?: number;
  dislikesCount?: number;

  userVote?: "like" | "dislike" | null;

  isVisible: boolean;
  isPinned: boolean;
}

interface AppContextType {
  sendMobileOTPSignup: (mobile: string) => Promise<void>;

  verifyMobileOTPSignup: (mobile: string, otp: string) => Promise<void>;
  // User & Auth State
  userLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  authLoading: boolean;
  accessToken: string | null;
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
  updateProfile: (username: string) => Promise<void>;
  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ) => Promise<void>;

  sendForgotPasswordOTP: (email: string) => Promise<void>;

  resetPasswordWithOTP: (
    email: string,
    otp: string,
    newPassword: string,
    confirmNewPassword: string,
  ) => Promise<void>;

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

  allProductQuestions: ProductQuestion[];

  fetchAllProductQuestions: () => Promise<void>;

  replyProductQuestion: (
    questionId: string,
    answer: string,
  ) => Promise<ProductQuestion | null>;

  deleteProductQuestion: (questionId: string) => Promise<void>;

  toggleProductQuestionVisibility: (
    questionId: string,
  ) => Promise<ProductQuestion | null>;

  toggleProductQuestionPin: (
    questionId: string,
  ) => Promise<ProductQuestion | null>;

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

  fetchProductQuestions: (productId: string) => Promise<void>;

  askProductQuestion: (productId: string, question: string) => Promise<void>;

  voteProductAnswer: (
    questionId: string,
    voteType: "like" | "dislike",
  ) => Promise<void>;

  productQuestions: ProductQuestion[];

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
    coupons: number;
  }>;

  dashboardStats: {
    users: number;
    products: number;
    orders: number;
    reviews: number;
    wishlists: number;
    messages: number;
    coupons: number;
  };
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
  const notify = useNotification();

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

  const [productQuestions, setProductQuestions] = useState<ProductQuestion[]>(
    [],
  );

  // ========== ADMIN STATE =========='
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [allWishlists, setAllWishlists] = useState<any[]>([]);
  const [allProductQuestions, setAllProductQuestions] = useState<
    ProductQuestion[]
  >([]);

  const [dashboardStats, setDashboardStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    reviews: 0,
    wishlists: 0,
    messages: 0,
    coupons: 0,
  });

  // ========== Product Question FUNCTIONS ==========
  const fetchAllProductQuestions = useCallback(async () => {
    if (!accessToken) {
      setAllProductQuestions([]);
      return;
    }

    try {
      const response = await api("/api/admin/getAllProductQuestions", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch product questions");
      }

      setAllProductQuestions(
        Array.isArray(data.questions) ? data.questions : [],
      );
    } catch (error) {
      console.error("Fetch admin product questions error:", error);
      setAllProductQuestions([]);
    }
  }, [accessToken]);

  const replyProductQuestion = useCallback(
    async (
      questionId: string,
      answer: string,
    ): Promise<ProductQuestion | null> => {
      if (!accessToken) {
        notify.error("Admin session not available");
        return null;
      }

      try {
        const response = await api(
          `/api/admin/productQuestions/${questionId}/reply`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              answer: answer.trim(),
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save reply");
        }

        setAllProductQuestions((previousQuestions) =>
          previousQuestions.map((item) =>
            item._id === questionId ? data.question : item,
          ),
        );

        notify.success(
          data.question?.status === "answered"
            ? "Reply saved successfully"
            : "Question updated successfully",
        );

        return data.question || null;
      } catch (error: any) {
        notify.error(error.message || "Failed to save reply");
        throw error;
      }
    },
    [accessToken],
  );

  const deleteProductQuestion = useCallback(
    async (questionId: string) => {
      if (!accessToken) {
        notify.error("Admin session not available");
        return;
      }

      try {
        const response = await api(
          `/api/admin/productQuestions/${questionId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to delete question");
        }

        setAllProductQuestions((previousQuestions) =>
          previousQuestions.filter((item) => item._id !== questionId),
        );

        notify.success("Question deleted successfully");
      } catch (error: any) {
        notify.error(error.message || "Failed to delete question");
        throw error;
      }
    },
    [accessToken],
  );

  const toggleProductQuestionVisibility = useCallback(
    async (questionId: string): Promise<ProductQuestion | null> => {
      if (!accessToken) {
        notify.error("Admin session not available");
        return null;
      }

      try {
        const response = await api(
          `/api/admin/productQuestions/${questionId}/toggle-visibility`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to update question visibility",
          );
        }

        setAllProductQuestions((previousQuestions) =>
          previousQuestions.map((item) =>
            item._id === questionId
              ? {
                  ...item,
                  ...data.question,

                  productId:
                    typeof data.question.productId === "string"
                      ? item.productId
                      : data.question.productId,

                  userId:
                    typeof data.question.userId === "string"
                      ? item.userId
                      : data.question.userId,

                  answeredBy:
                    typeof data.question.answeredBy === "string"
                      ? item.answeredBy
                      : data.question.answeredBy,
                }
              : item,
          ),
        );

        notify.success(data.message);

        return data.question || null;
      } catch (error: any) {
        notify.error(error.message || "Failed to update question visibility");
        throw error;
      }
    },
    [accessToken],
  );

  const toggleProductQuestionPin = useCallback(
    async (questionId: string): Promise<ProductQuestion | null> => {
      if (!accessToken) {
        notify.error("Admin session not available");
        return null;
      }

      try {
        const response = await api(
          `/api/admin/productQuestions/${questionId}/toggle-pin`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to update question pin status",
          );
        }

        setAllProductQuestions((previousQuestions) =>
          previousQuestions.map((item) =>
            item._id === questionId
              ? {
                  ...item,
                  ...data.question,

                  productId:
                    typeof data.question.productId === "string"
                      ? item.productId
                      : data.question.productId,

                  userId:
                    typeof data.question.userId === "string"
                      ? item.userId
                      : data.question.userId,

                  answeredBy:
                    typeof data.question.answeredBy === "string"
                      ? item.answeredBy
                      : data.question.answeredBy,
                }
              : item,
          ),
        );

        notify.success(data.message);

        return data.question || null;
      } catch (error: any) {
        notify.error(error.message || "Failed to update question pin status");
        throw error;
      }
    },
    [accessToken],
  );

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
          notify.success("Coupon created successfully!");
        }
        return data;
      } catch (error) {
        console.error(error);
        notify.error("Failed to create coupon.");
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
          notify.success("Coupon updated successfully!");
        }
        return data;
      } catch (error) {
        console.error(error);
        notify.error("Failed to update coupon.");
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
          notify.success("Coupon deleted successfully!");
        }
        return data;
      } catch (error) {
        console.error(error);
        notify.error("Failed to delete coupon.");
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
      notify.success("Coupon validated successfully!");
    } catch (error) {
      console.error(error);
      notify.error("Failed to validate coupon.");
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
      console.log(data);

      setUser(data.user);
      setUserLoggedIn(true);
      notify.success("Login successful!");
    } catch (error: any) {
      notify.error(error.message || "Login failed");
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

  const sendForgotPasswordOTP = useCallback(async (email: string) => {
    setLoading(true);

    try {
      const response = await api("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      notify.success(data.message);
    } catch (error: any) {
      notify.error(error.message || "Failed to send OTP");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  const resetPasswordWithOTP = useCallback(
    async (
      email: string,
      otp: string,
      newPassword: string,
      confirmNewPassword: string,
    ) => {
      setLoading(true);

      try {
        const response = await api("/api/auth/forgot-password/reset", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
            newPassword,
            confirmNewPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to reset password");
        }

        notify.success(data.message);
      } catch (error: any) {
        notify.error(error.message || "Failed to reset password");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

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

        notify.success("Account created successfully!");
      } catch (error: any) {
        notify.error(error.message || "Signup failed");
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

    notify.success("Logged out successfully! See you soon 👋");
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

      notify.success("OTP sent to your email!");
    } catch (error: any) {
      notify.error(error.message || "Failed to send OTP");
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

      notify.success("Email verified successfully!");
    } catch (error: any) {
      notify.error(error.message || "OTP verification failed");
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

      notify.success("OTP sent to your mobile!");
    } catch (error: any) {
      notify.error(error.message || "Failed to send mobile OTP");
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

        notify.success("Mobile verified successfully!");
      } catch (error: any) {
        notify.error(error.message || "OTP verification failed");
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

        notify.success("OTP sent to your new email!");
      } catch (error: any) {
        notify.error(error.message || "Failed to send OTP");
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

        notify.success("Email updated successfully!");
      } catch (error: any) {
        notify.error(error.message || "Email verification failed");
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

        notify.success("OTP sent to your new mobile number!");
      } catch (error: any) {
        notify.error(error.message || "Failed to send OTP");
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

        notify.success("Mobile number updated successfully!");
      } catch (error: any) {
        notify.error(error.message || "Mobile verification failed");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const updateProfile = useCallback(
    async (username: string) => {
      setLoading(true);

      try {
        const response = await api("/api/auth/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update profile");
        }

        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        notify.success("Profile updated successfully!");
      } catch (error: any) {
        notify.error(error.message || "Failed to update profile");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const changePassword = useCallback(
    async (
      oldPassword: string,
      newPassword: string,
      confirmNewPassword: string,
    ) => {
      setLoading(true);

      try {
        const response = await api("/api/auth/change-password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            oldPassword,
            newPassword,
            confirmNewPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to change password");
        }

        notify.success("Password changed successfully!");
      } catch (error: any) {
        notify.error(error.message || "Failed to change password");
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
        notify.success("Address added successfully!");
      } catch (error: any) {
        notify.error(error.message || "Failed to add address");
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

        notify.success("Address updated successfully!");
      } catch (error: any) {
        notify.error(error.message || "Failed to update address");
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
        notify.success("Address deleted successfully!");
      } catch (error: any) {
        notify.error(error.message || "Failed to delete address");
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
        notify.success("Default address updated!");
      } catch (error: any) {
        notify.error(error.message || "Failed to set default address");
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
        notify.error("Please login to add items to cart");
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
        notify.success("Item added to cart!");
      } catch (error: any) {
        notify.error(error.message || "Failed to add to cart");
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
        notify.error(error.message || "Failed to update cart");
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
        notify.success("Item removed from cart!");
      } catch (error: any) {
        notify.error(error.message || "Failed to remove from cart");
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
      notify.error(error.message || "Failed to clear cart");
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
        notify.error("Please login to add items to wishlist");
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
        notify.success("Item added to wishlist!");
      } catch (error: any) {
        notify.error(error.message || "Failed to add to wishlist");
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
        notify.success("Item removed from wishlist!");
      } catch (error: any) {
        notify.error(error.message || "Failed to remove from wishlist");
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
        notify.error("Please login to place an order");
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

        notify.success("Order placed successfully!");

        if (!response.ok) {
          throw new Error(data.message || "Failed to create order");
        }

        // Save latest order
        sessionStorage.setItem("latestOrder", JSON.stringify(data.order));

        await clearCart();
        await fetchOrders();
      } catch (error: any) {
        notify.error(error.message || "Failed to create order");
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
        notify.error("Please login to submit a review");
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
        notify.success("Review submitted successfully!");
      } catch (error: any) {
        notify.error(error.message || "Failed to submit review");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user?.email, fetchProductReviews],
  );

  // ========== PRODUCT QUESTION FUNCTIONS ==========

  const fetchProductQuestions = useCallback(
    async (productId: string) => {
      try {
        const response = await api(`/api/questions/${productId}`, {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : undefined,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch product questions");
        }

        setProductQuestions(data.questions || []);
      } catch (error) {
        console.error("Error fetching product questions:", error);
        setProductQuestions([]);
      }
    },
    [accessToken],
  );

  const askProductQuestion = useCallback(
    async (productId: string, question: string) => {
      if (!user?.email || !accessToken) {
        notify.error("Please login to ask a question");
        throw new Error("Login required");
      }

      const cleanedQuestion = question.trim();

      if (cleanedQuestion.length < 5) {
        notify.error("Question must contain at least 5 characters");
        throw new Error("Question is too short");
      }

      try {
        const response = await api("/api/questions/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            productId,
            question: cleanedQuestion,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to submit question");
        }

        await fetchProductQuestions(productId);

        notify.success(
          "Question submitted. Awaiting response from TechVault Support.",
        );
      } catch (error: any) {
        notify.error(error.message || "Failed to submit question");
        throw error;
      }
    },
    [user?.email, accessToken, fetchProductQuestions],
  );

  const voteProductAnswer = useCallback(
    async (questionId: string, voteType: "like" | "dislike") => {
      if (!user?.email || !accessToken) {
        notify.error("Please login to vote");
        throw new Error("Login required");
      }

      try {
        const response = await api(`/api/questions/${questionId}/vote`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            voteType,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to record vote");
        }

        setProductQuestions((previousQuestions) =>
          previousQuestions.map((item) =>
            item._id === questionId
              ? {
                  ...item,
                  likesCount: data.likesCount,
                  dislikesCount: data.dislikesCount,
                  userVote: data.userVote,
                }
              : item,
          ),
        );
      } catch (error: any) {
        notify.error(error.message || "Failed to record vote");
        throw error;
      }
    },
    [user, accessToken],
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

        notify.success("Message sent successfully!");
      } catch (error: any) {
        notify.error(error.message || "Failed to submit contact");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // ========== ADMIN FUNCTIONS ==========

  const adminHeaders = () => ({
    Authorization: `Bearer ${accessToken}`,
  });

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await api("/api/admin/getAllUsers", {
        headers: adminHeaders(),
      });
      const data = await response.json();
      setAllUsers(data.users || data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
    }
  }, [accessToken]);

  const fetchAllOrders = useCallback(async () => {
    try {
      const response = await api("/api/admin/orders/fetchAllOrders", {
        headers: adminHeaders(),
      });
      const data = await response.json();
      setAllOrders(data.orders || data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAllOrders([]);
    }
  }, [accessToken]);

  const fetchAllContacts = useCallback(async () => {
    try {
      const response = await api("/api/admin/getAllContacts", {
        headers: adminHeaders(),
      });
      const data = await response.json();
      setAllContacts(data.contacts || data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setAllContacts([]);
    }
  }, [accessToken]);

  const fetchAllReviews = useCallback(async () => {
    try {
      const response = await api("/api/admin/getAllReviews", {
        headers: adminHeaders(),
      });
      const data = await response.json();
      setAllReviews(data.reviews || data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setAllReviews([]);
    }
  }, [accessToken]);

  const fetchAllWishlists = useCallback(async () => {
    try {
      const response = await api("/api/admin/getAllWishlists", {
        headers: adminHeaders(),
      });
      const data = await response.json();
      setAllWishlists(data.wishlists || data || []);
    } catch (error) {
      console.error("Error fetching wishlists:", error);
      setAllWishlists([]);
    }
  }, [accessToken]);

  const fetchAdminProducts = useCallback(async () => {
    // Renamed from fetchAllProducts
    try {
      const response = await api("/api/admin/getAllProducts", {
        headers: adminHeaders(),
      });
      const data = await response.json();
      setAdminProducts(data.products || data || []); // Updated to setAdminProducts
    } catch (error) {
      console.error("Error fetching admin products:", error);
      setAdminProducts([]);
    }
  }, [accessToken]);

  const incrementProductView = useCallback(
    async (productId: string) => {
      try {
        await api(`/api/products/products/${productId}/view`, {
          method: "PUT",
        });
      } catch (error) {
        console.error("View count update failed:", error);
      }
    },
    [accessToken],
  );

  const fetchDashboardStats = useCallback(async () => {
    if (!accessToken) {
      throw new Error("Unauthorized");
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    const [
      usersRes,
      productsRes,
      messagesRes,
      ordersRes,
      wishlistsRes,
      reviewsRes,
      couponsRes,
    ] = await Promise.all([
      api("/api/admin/getAllUsers", { headers }),
      api("/api/admin/getAllProducts", { headers }),
      api("/api/admin/getAllContacts", { headers }),
      api("/api/admin/orders/fetchAllOrders", { headers }),
      api("/api/admin/getAllWishlists", { headers }),
      api("/api/admin/getAllReviews", { headers }),
      api("/api/coupons", { headers }),
    ]);

    const [
      usersData,
      productsData,
      messagesData,
      ordersData,
      wishlistsData,
      reviewsData,
      couponsData,
    ] = await Promise.all([
      usersRes.json(),
      productsRes.json(),
      messagesRes.json(),
      ordersRes.json(),
      wishlistsRes.json(),
      reviewsRes.json(),
      couponsRes.json(),
    ]);

    if (
      !usersRes.ok ||
      !productsRes.ok ||
      !messagesRes.ok ||
      !ordersRes.ok ||
      !wishlistsRes.ok ||
      !reviewsRes.ok ||
      !couponsRes.ok
    ) {
      throw new Error(
        usersData.message ||
          productsData.message ||
          messagesData.message ||
          ordersData.message ||
          wishlistsData.message ||
          reviewsData.message ||
          couponsData.message ||
          "Failed to fetch dashboard statistics",
      );
    }

    const users = Array.isArray(usersData) ? usersData : usersData.users || [];
    const products = Array.isArray(productsData)
      ? productsData
      : productsData.products || [];
    const messages = Array.isArray(messagesData)
      ? messagesData
      : messagesData.contacts || [];
    const orders = Array.isArray(ordersData)
      ? ordersData
      : ordersData.orders || [];
    const wishlists = Array.isArray(wishlistsData)
      ? wishlistsData
      : wishlistsData.wishlists || [];
    const reviews = Array.isArray(reviewsData)
      ? reviewsData
      : reviewsData.reviews || [];
    const coupons = Array.isArray(couponsData)
      ? couponsData
      : couponsData.coupons || [];

    setAllUsers(users);
    setAdminProducts(products);
    setAllContacts(messages);
    setAllOrders(orders);
    setAllWishlists(wishlists);
    setAllReviews(reviews);
    setCoupons(coupons);

    const stats = {
      users: users.length,
      products: products.length,
      messages: messages.length,
      orders: orders.length,
      wishlists: wishlists.length,
      reviews: reviews.length,
      coupons: coupons.length,
    };

    setDashboardStats(stats);

    return stats;
  }, [accessToken]);

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        const response = await api(`/api/admin/deleteUser/${userId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        await fetchAllUsers();
        notify.success("User deleted successfully!");
      } catch (error: any) {
        notify.error(error.message || "Failed to delete user");
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to make admin");
        }

        await fetchAllUsers();
        notify.success("User promoted to admin!");
      } catch (error: any) {
        notify.error(error.message || "Failed to make admin");
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to remove admin");
        }

        await fetchAllUsers();
        notify.success("Admin privileges removed!");
      } catch (error: any) {
        notify.error(error.message || "Failed to remove admin");
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete contact");
        }

        await fetchAllContacts();
        notify.success("Contact deleted!");
      } catch (error: any) {
        notify.error(error.message || "Failed to delete contact");
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
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ id: orderId, status }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order status");
        }

        await fetchAllOrders();
        notify.success("Order status updated!");
      } catch (error: any) {
        notify.error(error.message || "Failed to update order status");
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
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ id: orderId, paymentStatus }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update payment status");
        }

        await fetchAllOrders();
        notify.success("Payment status updated!");
      } catch (error: any) {
        notify.error(error.message || "Failed to update payment status");
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete order");
        }

        await fetchAllOrders();
        notify.success("Order deleted!");
      } catch (error: any) {
        notify.error(error.message || "Failed to delete order");
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

        notify.success("Product added successfully!");
        await fetchAdminProducts();
      } catch (error: any) {
        notify.error(error.message);
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

        notify.success("Product updated successfully!");
        await fetchAdminProducts();
      } catch (error: any) {
        notify.error(error.message);
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
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete product");
        }

        await fetchAdminProducts(); // Updated to fetchAdminProducts
        notify.success("Product deleted!");
      } catch (error: any) {
        notify.error(error.message || "Failed to delete product");
        throw error;
      }
    },
    [fetchAdminProducts],
  ); // Updated dependency

  // ========== INITIAL EFFECTS ==========

  useEffect(() => {
    if (!userLoggedIn || !user) return;

    const preloadData = async () => {
      await Promise.allSettled([
        fetchProducts(),
        fetchCart(),
        fetchCartCount(),
        fetchWishlistItems(),
        fetchWishlistCount(),
        fetchAddresses(),
        fetchOrders(),
        fetchCoupons(),
      ]);

      if (user.role === "admin") {
        await Promise.allSettled([
          fetchAdminProducts(),
          fetchAllOrders(),
          fetchAllUsers(),
          fetchAllContacts(),
          fetchAllReviews(),
          fetchAllWishlists(),
          fetchDashboardStats(),
          fetchAllProductQuestions(),
        ]);
      }
    };

    preloadData();
  }, [
    userLoggedIn,
    user,
    fetchProducts,
    fetchCart,
    fetchCartCount,
    fetchWishlistItems,
    fetchWishlistCount,
    fetchAddresses,
    fetchOrders,
    fetchCoupons,
    fetchAdminProducts,
    fetchAllOrders,
    fetchAllUsers,
    fetchAllContacts,
    fetchAllReviews,
    fetchAllWishlists,
    fetchDashboardStats,
    fetchAllProductQuestions,
  ]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);
  useEffect(() => {
    fetchProducts();
  }, []);

  // ========== CONTEXT VALUE ==========

  const value: AppContextType = {
    allProductQuestions,
    fetchAllProductQuestions,
    replyProductQuestion,
    deleteProductQuestion,
    toggleProductQuestionVisibility,
    toggleProductQuestionPin,
    dashboardStats,
    accessToken,
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
    changePassword,
    sendForgotPasswordOTP,
    resetPasswordWithOTP,
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
    productQuestions,
    fetchProductQuestions,
    askProductQuestion,
    voteProductAnswer,
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
