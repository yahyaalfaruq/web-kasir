import React, { useState, useEffect, useRef, useMemo } from "react";
import Head from "next/head";
import {
  NavTab,
  StoreConfig,
  UserAccount,
  ProductItem,
  CartItem,
  CustomerItem,
  TransactionRecord,
  DEFAULT_STORE_CONFIG,
  ASSET_OPTIONS,
  DEFAULT_PRODUCTS,
  DEFAULT_ACCOUNTS,
  formatRupiah,
  getInitials,
} from "@/lib/types";

const STORAGE_KEYS = {
  THEME: "lokanota_theme_v1",
  STORE: "lokanota_store_config_v1",
  ACCOUNTS: "lokanota_accounts_v1",
  SESSION: "lokanota_session_v1",
  PRODUCTS: "lokanota_products_v1",
  CUSTOMERS: "lokanota_customers_v1",
  TRANSACTIONS: "lokanota_transactions_v1",
  CART: "lokanota_cart_v1",
};

export default function LokaNotaApp() {
  // Theme state (R-21, R-34: Working Light & Dark mode)
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  // Store Identity Config (User customizable so nothing is hardcoded to a stranger's name)
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [cfgBrand, setCfgBrand] = useState(DEFAULT_STORE_CONFIG.brandName);
  const [cfgTagline, setCfgTagline] = useState(DEFAULT_STORE_CONFIG.tagline);
  const [cfgBranch, setCfgBranch] = useState(DEFAULT_STORE_CONFIG.branchName);
  const [cfgAddress, setCfgAddress] = useState(DEFAULT_STORE_CONFIG.address);
  const [cfgFooter, setCfgFooter] = useState(DEFAULT_STORE_CONFIG.receiptFooter);

  // System UI state (R-27: Loading, Error, Ready states)
  const [systemState, setSystemState] = useState<"loading" | "ready" | "error">("loading");
  const [errorReason, setErrorReason] = useState<string>("");

  // Authentication state
  const [accounts, setAccounts] = useState<UserAccount[]>(DEFAULT_ACCOUNTS);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("kasir@lokanota.id");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Registration form state
  const [regName, setRegName] = useState("");
  const [regStore, setRegStore] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<"Kasir Shift" | "Kepala Kedai">("Kasir Shift");

  // Navigation & Shell state
  const [activeTab, setActiveTab] = useState<NavTab>("pos");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const posSearchInputRef = useRef<HTMLInputElement | null>(null);

  // Core POS & Store Data
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // POS Filters & Order Controls
  const [posSearch, setPosSearch] = useState("");
  const [posCategory, setPosCategory] = useState("Semua");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(false);

  // Payment & Receipt Modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "QRIS" | "Kartu Debit">("Tunai");
  const [amountPaidInput, setAmountPaidInput] = useState<string>("");
  const [orderNote, setOrderNote] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");
  const [activeReceipt, setActiveReceipt] = useState<TransactionRecord | null>(null);

  // Product Management state
  const [inventorySearch, setInventorySearch] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodSku, setProdSku] = useState("");
  const [prodCategory, setProdCategory] = useState("Pastry Manis");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodImg, setProdImg] = useState(ASSET_OPTIONS[0].value);
  const [prodFormError, setProdFormError] = useState("");

  // Customer Management state
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custFormError, setCustFormError] = useState("");

  // Transaction History Filters
  const [txSearch, setTxSearch] = useState("");
  const [txMethodFilter, setTxMethodFilter] = useState<string>("Semua");

  // Toast feedback banner
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setStatusBanner(msg);
  };

  useEffect(() => {
    if (!statusBanner) return;
    const timer = setTimeout(() => setStatusBanner(null), 4000);
    return () => clearTimeout(timer);
  }, [statusBanner]);

  // Initial Hydration
  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as "dark" | "light" | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      } else {
        setTheme("light");
      }

      const savedStore = localStorage.getItem(STORAGE_KEYS.STORE);
      if (savedStore) {
        const parsedStore: StoreConfig = JSON.parse(savedStore);
        setStoreConfig(parsedStore);
        setCfgBrand(parsedStore.brandName);
        setCfgTagline(parsedStore.tagline);
        setCfgBranch(parsedStore.branchName);
        setCfgAddress(parsedStore.address);
        setCfgFooter(parsedStore.receiptFooter);
      }

      const savedAccounts = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (savedAccounts) {
        const parsedAcc = JSON.parse(savedAccounts);
        if (Array.isArray(parsedAcc) && parsedAcc.length > 0) {
          setAccounts(parsedAcc);
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      }

      const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (savedSession) {
        setCurrentUser(JSON.parse(savedSession));
      }

      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProducts) {
        const parsedProd = JSON.parse(savedProducts);
        if (Array.isArray(parsedProd) && parsedProd.length > 0) {
          setProducts(parsedProd);
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
      }

      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      }

      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }

      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      setSystemState("ready");
    } catch {
      setErrorReason("Gagal membaca penyimpanan lokal browser. Silakan muat ulang data.");
      setSystemState("error");
    }
  }, []);

  // Apply theme class to <html> element
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme, mounted]);

  // Persist changes to localStorage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart, mounted]);

  // Global Escape key handler for all modals & mobile drawer (R-32, R-26)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeReceipt) {
          setActiveReceipt(null);
          return;
        }
        if (paymentModalOpen) {
          setPaymentModalOpen(false);
          return;
        }
        if (productModalOpen) {
          setProductModalOpen(false);
          return;
        }
        if (customerModalOpen) {
          setCustomerModalOpen(false);
          return;
        }
        if (mobileNavOpen) {
          setMobileNavOpen(false);
          mobileTriggerRef.current?.focus();
          return;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeReceipt, paymentModalOpen, productModalOpen, customerModalOpen, mobileNavOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Authentication Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);
    const trimmedEmail = loginEmail.trim().toLowerCase();
    if (!trimmedEmail || !loginPassword) {
      setAuthMessage({
        type: "error",
        text: "Mohon isi alamat email kasir dan kata sandi terlebih dahulu.",
      });
      return;
    }

    const found = accounts.find(
      (acc) => acc.email.toLowerCase() === trimmedEmail && acc.password === loginPassword
    );
    if (!found) {
      setAuthMessage({
        type: "error",
        text: "Email atau kata sandi tidak cocok. Klik kartu Shift Instan di panel kiri atau daftar petugas baru.",
      });
      return;
    }

    setCurrentUser(found);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(found));
    showFeedback(`Shift kasir dibuka oleh ${found.name} (${found.storeName}).`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage(null);

    const cleanName = regName.trim();
    const cleanStore = regStore.trim() || storeConfig.branchName;
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !regPassword) {
      setAuthMessage({
        type: "error",
        text: "Nama petugas, email, dan kata sandi wajib diisi lengkap.",
      });
      return;
    }
    if (regPassword.length < 6) {
      setAuthMessage({
        type: "error",
        text: "Kata sandi minimal terdiri dari 6 karakter.",
      });
      return;
    }
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      setAuthMessage({
        type: "error",
        text: "Email tersebut sudah terdaftar. Silakan gunakan tab Buka Shift Kasir.",
      });
      return;
    }

    const newAcc: UserAccount = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      storeName: cleanStore,
      email: cleanEmail,
      password: regPassword,
      role: regRole,
    };

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(updated));
    setCurrentUser(newAcc);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newAcc));
    showFeedback(`Akun petugas ${newAcc.name} berhasil didaftarkan dan shift langsung dibuka.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    setAuthMessage({
      type: "success",
      text: "Shift kasir telah ditutup. Silakan masuk kembali untuk membuka meja kasir.",
    });
  };

  const handleQuickShiftLogin = (acc: UserAccount) => {
    setCurrentUser(acc);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(acc));
    showFeedback(`Meja kasir langsung dibuka untuk ${acc.name}.`);
  };

  const handleSaveStoreConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const nextConfig: StoreConfig = {
      brandName: cfgBrand.trim() || "LokaNota",
      tagline: cfgTagline.trim() || "Sistem Kasir & Buku Nota Kedai",
      branchName: cfgBranch.trim() || "Kedai Artisan & Bakery",
      address: cfgAddress.trim() || "Jl. Raya Utama No. 18",
      receiptFooter:
        cfgFooter.trim() || "Barang yang sudah dibeli tidak dapat ditukar. Terima kasih!",
    };
    setStoreConfig(nextConfig);
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(nextConfig));
    showFeedback("Identitas kedai dan format nota berhasil disimpan.");
  };

  // POS Categories & Filtered Products
  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return ["Semua", ...unique];
  }, [products]);

  const filteredPosProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCat = posCategory === "Semua" || item.category === posCategory;
      const q = posSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        item.productname.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, posCategory, posSearch]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Math.round((cartSubtotal * discountPercent) / 100);
  }, [cartSubtotal, discountPercent]);

  const taxableBase = Math.max(0, cartSubtotal - discountAmount);

  const taxAmount = useMemo(() => {
    return taxEnabled ? Math.round(taxableBase * 0.11) : 0;
  }, [taxableBase, taxEnabled]);

  const cartGrandTotal = taxableBase + taxAmount;

  const totalItemsInCart = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Cart Actions
  const addToCart = (product: ProductItem) => {
    if (product.stock <= 0) {
      showFeedback(`Stok ${product.productname} sedang habis.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showFeedback(`Batas stok ${product.productname} (${product.stock} unit) telah tercapai.`);
          return prev;
        }
        return prev.map((c) =>
          c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: number, delta: number) => {
    const latestProduct = products.find((p) => p.id === productId);
    setCart((prev) => {
      return prev
        .map((c) => {
          if (c.product.id !== productId) return c;
          const nextQty = c.quantity + delta;
          if (latestProduct && nextQty > latestProduct.stock) {
            showFeedback(`Stok maksimal ${latestProduct.productname} adalah ${latestProduct.stock} unit.`);
            return c;
          }
          return { ...c, quantity: nextQty };
        })
        .filter((c) => c.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setTaxEnabled(false);
    setSelectedCustomerId(null);
    showFeedback("Lembar nota aktif telah dikosongkan.");
  };

  // Checkout & Payment Handlers
  const openPaymentModal = () => {
    if (cart.length === 0) {
      showFeedback("Tambahkan minimal 1 menu ke lembar nota sebelum memproses pembayaran.");
      return;
    }
    setPaymentError("");
    setPaymentMethod("Tunai");
    setAmountPaidInput(String(cartGrandTotal));
    setOrderNote("");
    setPaymentModalOpen(true);
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");

    const paidNumber =
      paymentMethod === "Tunai" ? Number(amountPaidInput || 0) : cartGrandTotal;

    if (paymentMethod === "Tunai" && (isNaN(paidNumber) || paidNumber < cartGrandTotal)) {
      setPaymentError(
        `Uang tunai diterima (${formatRupiah(paidNumber || 0)}) kurang dari total tagihan (${formatRupiah(
          cartGrandTotal
        )}).`
      );
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const seqPart = String(transactions.length + 1).padStart(4, "0");
    const invoiceNo = `NOTA-${datePart}-${seqPart}`;

    const newRecord: TransactionRecord = {
      id: `tx-${Date.now()}`,
      invoiceNo,
      createdAt: now.toISOString(),
      cashierName: currentUser?.name || "Kasir Shift",
      storeName: storeConfig.branchName,
      customerName: selectedCustomer ? selectedCustomer.name : "Pelanggan Umum",
      customerId: selectedCustomer ? selectedCustomer.id : null,
      items: cart.map((c) => ({
        productId: c.product.id,
        sku: c.product.sku,
        productname: c.product.productname,
        price: c.product.price,
        quantity: c.quantity,
        subtotal: c.product.price * c.quantity,
      })),
      subtotal: cartSubtotal,
      discountPercent,
      discountAmount,
      taxEnabled,
      taxAmount,
      totalAmount: cartGrandTotal,
      paymentMethod,
      amountPaid: paidNumber,
      changeAmount: Math.max(0, paidNumber - cartGrandTotal),
      note: orderNote.trim(),
    };

    // Update stock locally
    setProducts((prev) =>
      prev.map((prod) => {
        const line = cart.find((c) => c.product.id === prod.id);
        if (!line) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - line.quantity) };
      })
    );

    // Sync to API endpoint in background
    try {
      for (const item of cart) {
        fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
          }),
        }).catch(() => {});
      }
    } catch {
      // Handled by localStorage hybrid state
    }

    setTransactions((prev) => [newRecord, ...prev]);
    setCart([]);
    setDiscountPercent(0);
    setTaxEnabled(false);
    setSelectedCustomerId(null);
    setPaymentModalOpen(false);
    setActiveReceipt(newRecord);
    showFeedback(`Transaksi ${invoiceNo} berhasil dibukukan.`);
  };

  // Product Management CRUD
  const openAddProductModal = () => {
    setEditingProduct(null);
    const nextNum = products.length + 1;
    setProdName("");
    setProdSku(`BKR-${String(nextNum).padStart(3, "0")}`);
    setProdCategory("Pastry Manis");
    setProdPrice("");
    setProdStock("20");
    setProdDesc("");
    setProdImg(ASSET_OPTIONS[0].value);
    setProdFormError("");
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setProdName(prod.productname);
    setProdSku(prod.sku);
    setProdCategory(prod.category);
    setProdPrice(String(prod.price));
    setProdStock(String(prod.stock));
    setProdDesc(prod.description);
    setProdImg(prod.img);
    setProdFormError("");
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdFormError("");

    const cleanName = prodName.trim();
    const cleanSku = prodSku.trim().toUpperCase();
    const cleanCat = prodCategory.trim() || "Umum";
    const numPrice = Number(prodPrice);
    const numStock = Number(prodStock);

    if (!cleanName || !cleanSku || isNaN(numPrice) || numPrice <= 0) {
      setProdFormError("Nama menu, kode barang, dan harga jual (> Rp 0) wajib diisi dengan benar.");
      return;
    }

    if (editingProduct) {
      const updatedItem: ProductItem = {
        ...editingProduct,
        productname: cleanName,
        sku: cleanSku,
        category: cleanCat,
        price: numPrice,
        stock: Math.max(0, isNaN(numStock) ? 0 : numStock),
        description: prodDesc.trim() || "Menu siap jual di etalase kedai",
        img: prodImg,
      };
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updatedItem : p)));
      setCart((prev) =>
        prev.map((c) => (c.product.id === editingProduct.id ? { ...c, product: updatedItem } : c))
      );
      fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      }).catch(() => {});
      showFeedback(`Menu "${cleanName}" berhasil diperbarui.`);
    } else {
      const newItem: ProductItem = {
        id: Date.now(),
        productname: cleanName,
        sku: cleanSku,
        category: cleanCat,
        price: numPrice,
        stock: Math.max(0, isNaN(numStock) ? 0 : numStock),
        description: prodDesc.trim() || "Menu siap jual di etalase kedai",
        img: prodImg,
      };
      setProducts((prev) => [...prev, newItem]);
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      }).catch(() => {});
      showFeedback(`Menu baru "${cleanName}" ditambahkan ke gudang menu.`);
    }

    setProductModalOpen(false);
  };

  const handleDeleteProduct = (prod: ProductItem) => {
    setProducts((prev) => prev.filter((p) => p.id !== prod.id));
    setCart((prev) => prev.filter((c) => c.product.id !== prod.id));
    fetch(`/api/products/${prod.id}`, { method: "DELETE" }).catch(() => {});
    showFeedback(`Menu "${prod.productname}" telah dihapus.`);
  };

  const handleResetCatalog = () => {
    setProducts(DEFAULT_PRODUCTS);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    showFeedback("Daftar menu telah dikembalikan ke 6 produk bawaan.");
  };

  // Customer Management CRUD
  const openAddCustomerModal = () => {
    setEditingCustomer(null);
    setCustName("");
    setCustEmail("");
    setCustPhone("");
    setCustFormError("");
    setCustomerModalOpen(true);
  };

  const openEditCustomerModal = (cust: CustomerItem) => {
    setEditingCustomer(cust);
    setCustName(cust.name);
    setCustEmail(cust.email);
    setCustPhone(cust.phone);
    setCustFormError("");
    setCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustFormError("");

    const cleanName = custName.trim();
    const cleanEmail = custEmail.trim();
    const cleanPhone = custPhone.trim();

    if (!cleanName || !cleanEmail || !cleanPhone) {
      setCustFormError("Nama pelanggan, email, dan nomor telepon wajib diisi.");
      return;
    }

    if (editingCustomer) {
      const updatedCust: CustomerItem = {
        ...editingCustomer,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      };
      setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? updatedCust : c)));
      fetch(`/api/customers/${editingCustomer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCust),
      }).catch(() => {});
      showFeedback(`Data pelanggan "${cleanName}" telah diperbarui.`);
    } else {
      const newCust: CustomerItem = {
        id: Date.now(),
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        createdAt: new Date().toISOString(),
      };
      setCustomers((prev) => [...prev, newCust]);
      setSelectedCustomerId(newCust.id);
      fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCust),
      }).catch(() => {});
      showFeedback(`Pelanggan "${cleanName}" berhasil didaftarkan.`);
    }

    setCustomerModalOpen(false);
  };

  const handleDeleteCustomer = (cust: CustomerItem) => {
    setCustomers((prev) => prev.filter((c) => c.id !== cust.id));
    if (selectedCustomerId === cust.id) {
      setSelectedCustomerId(null);
    }
    fetch(`/api/customers/${cust.id}`, { method: "DELETE" }).catch(() => {});
    showFeedback(`Pelanggan "${cust.name}" telah dihapus.`);
  };

  const handleDeleteTransaction = (tx: TransactionRecord) => {
    setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
    showFeedback(`Arsip nota ${tx.invoiceNo} telah dihapus.`);
  };

  // Filtered Inventory, Customers, and Transactions
  const filteredInventory = useMemo(() => {
    const q = inventorySearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.productname.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, inventorySearch]);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }, [customers, customerSearch]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchMethod = txMethodFilter === "Semua" || tx.paymentMethod === txMethodFilter;
      const q = txSearch.trim().toLowerCase();
      const matchQuery =
        !q ||
        tx.invoiceNo.toLowerCase().includes(q) ||
        tx.customerName.toLowerCase().includes(q) ||
        tx.cashierName.toLowerCase().includes(q);
      return matchMethod && matchQuery;
    });
  }, [transactions, txMethodFilter, txSearch]);

  // Real calculated metrics from actual state (R-17, R-38)
  const totalRevenueRecorded = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  }, [transactions]);

  const totalUnitsSold = useMemo(() => {
    return transactions.reduce(
      (sum, tx) => sum + tx.items.reduce((s, line) => s + line.quantity, 0),
      0
    );
  }, [transactions]);

  const totalStockUnits = useMemo(() => {
    return products.reduce((sum, p) => sum + p.stock, 0);
  }, [products]);

  // Screen Title for single H1 hierarchy (R-39)
  const screenHeading = useMemo(() => {
    switch (activeTab) {
      case "pos":
        return "Meja Kasir & Lembar Nota";
      case "transactions":
        return "Buku Arsip Nota Penjualan";
      case "products":
        return "Gudang Menu & Daftar Harga";
      case "customers":
        return "Buku Pelanggan Kedai";
      case "settings":
        return "Pengaturan Identitas Kedai & Struk";
    }
  }, [activeTab]);

  // ============================================================================
  // VIEW 1: ASYMMETRIC SPLIT-SCREEN SHIFT TERMINAL (NOT A CENTERED CLONE CARD!)
  // ============================================================================
  if (!currentUser) {
    return (
      <>
        <Head>
          <title>{`Buka Shift Kasir | ${storeConfig.brandName}`}</title>
          <meta
            name="description"
            content={`${storeConfig.brandName} - ${storeConfig.tagline}`}
          />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>

        <div className="min-h-screen flex flex-col justify-between bg-[#faf8f5] text-stone-900 dark:bg-[#12100e] dark:text-stone-100">
          {/* Top Bar */}
          <header className="w-full border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="px-2.5 py-1.5 rounded bg-amber-700 text-white font-mono text-xs font-bold tracking-wider uppercase"
                  aria-hidden="true"
                >
                  [NOTA]
                </div>
                <div>
                  <span className="text-base font-bold tracking-tight block">
                    {storeConfig.brandName}
                  </span>
                  <span className="text-xs text-stone-600 dark:text-stone-400 block">
                    {storeConfig.branchName}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                title={theme === "dark" ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
                aria-label={theme === "dark" ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
                className="min-w-[44px] min-h-[44px] rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
              >
                {theme === "dark" ? (
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-stone-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </header>

          {/* Main Asymmetric Split Register Desk */}
          <main className="flex-1 flex items-center py-8 px-4 sm:px-6">
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column (7 cols): Operational Shift Board & Quick Access */}
              <section
                aria-label="Papan Informasi Shift Kedai"
                className="lg:col-span-7 bg-white dark:bg-[#1c1917] border-2 border-stone-300 dark:border-stone-800 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 text-xs font-mono font-bold">
                    <span>TERMINAL MEJA KASIR</span>
                    <span>•</span>
                    <span>{storeConfig.branchName}</span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
                    {storeConfig.brandName}: {storeConfig.tagline}
                  </h1>

                  <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed">
                    Kelola pesanan harian, cetak struk kertas termal, pantau stok roti & minuman,
                    serta sesuaikan nama kedai Anda sendiri langsung dari satu meja kerja.
                  </p>

                  {/* Real Live Catalog Ledger Preview */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3.5 rounded-lg bg-[#faf8f5] dark:bg-[#12100e] border border-stone-200 dark:border-stone-800">
                      <span className="text-xs text-stone-600 dark:text-stone-400 block">
                        Menu Terdaftar
                      </span>
                      <span className="text-xl font-bold font-mono tabular-nums mt-0.5 block">
                        {products.length} Varian
                      </span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#faf8f5] dark:bg-[#12100e] border border-stone-200 dark:border-stone-800">
                      <span className="text-xs text-stone-600 dark:text-stone-400 block">
                        Total Stok Siap
                      </span>
                      <span className="text-xl font-bold font-mono tabular-nums mt-0.5 block">
                        {totalStockUnits} Unit
                      </span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-[#faf8f5] dark:bg-[#12100e] border border-stone-200 dark:border-stone-800">
                      <span className="text-xs text-stone-600 dark:text-stone-400 block">
                        Nota Tercatat
                      </span>
                      <span className="text-xl font-bold font-mono tabular-nums mt-0.5 block">
                        {transactions.length} Nota
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick 1-Click Shift Card */}
                <div className="pt-6 border-t border-dashed border-stone-300 dark:border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
                      Akses Cepat Shift Kasir Terdaftar
                    </h2>
                    <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                      Klik untuk langsung buka meja kasir
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {accounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleQuickShiftLogin(acc)}
                        className="min-h-[44px] p-3.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] hover:border-amber-700 dark:hover:border-amber-500 text-left flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-stone-900 dark:text-white block truncate">
                            {acc.name}
                          </span>
                          <span className="text-xs text-stone-600 dark:text-stone-400 font-mono block truncate">
                            {acc.email} • {acc.role}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-amber-700 text-white text-xs font-bold shrink-0">
                          Buka Shift
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Right Column (5 cols): Form Buka Shift & Registrasi Petugas */}
              <section
                aria-label="Formulir Autentikasi Kasir"
                className="lg:col-span-5 bg-white dark:bg-[#1c1917] border-2 border-stone-300 dark:border-stone-800 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Underline Tab Bar (Different from OmniKasir pill switcher) */}
                  <div
                    role="tablist"
                    aria-label="Mode masuk atau registrasi"
                    className="grid grid-cols-2 border-b border-stone-200 dark:border-stone-800 bg-[#faf8f5] dark:bg-[#12100e]"
                  >
                    <button
                      type="button"
                      role="tab"
                      id="tab-login"
                      aria-selected={authTab === "login"}
                      aria-controls="panel-login"
                      onClick={() => {
                        setAuthTab("login");
                        setAuthMessage(null);
                      }}
                      className={`min-h-[48px] px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                        authTab === "login"
                          ? "border-amber-700 text-amber-800 dark:text-amber-400 bg-white dark:bg-[#1c1917]"
                          : "border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      1. Buka Shift Kasir
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="tab-register"
                      aria-selected={authTab === "register"}
                      aria-controls="panel-register"
                      onClick={() => {
                        setAuthTab("register");
                        setAuthMessage(null);
                      }}
                      className={`min-h-[48px] px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
                        authTab === "register"
                          ? "border-amber-700 text-amber-800 dark:text-amber-400 bg-white dark:bg-[#1c1917]"
                          : "border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      2. Petugas Baru
                    </button>
                  </div>

                  <div className="p-6 sm:p-7">
                    {authMessage && (
                      <div
                        role="alert"
                        className={`mb-5 p-3.5 rounded-lg border text-xs font-medium ${
                          authMessage.type === "error"
                            ? "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200"
                            : "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                        }`}
                      >
                        {authMessage.text}
                      </div>
                    )}

                    {authTab === "login" ? (
                      <form
                        id="panel-login"
                        role="tabpanel"
                        aria-labelledby="tab-login"
                        onSubmit={handleLoginSubmit}
                        className="space-y-4"
                      >
                        <div>
                          <h2 className="text-base font-bold text-stone-900 dark:text-white">
                            Masuk ke Meja Kasir
                          </h2>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                            Masukkan kredensial petugas shift untuk mulai melayani pesanan.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="login-email"
                            className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5"
                          >
                            Alamat Email Petugas
                          </label>
                          <input
                            id="login-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="kasir@lokanota.id"
                            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-stone-900 dark:text-white placeholder:text-stone-500 text-sm font-mono"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="login-password"
                            className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5"
                          >
                            Kata Sandi Shift
                          </label>
                          <div className="relative flex items-center">
                            <input
                              id="login-password"
                              type={showPassword ? "text" : "password"}
                              required
                              autoComplete="current-password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="Masukkan kata sandi"
                              className="w-full min-h-[44px] pl-3.5 pr-16 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-stone-900 dark:text-white placeholder:text-stone-500 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              aria-label={
                                showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"
                              }
                              className="absolute right-1 min-h-[40px] px-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-amber-700 rounded"
                            >
                              {showPassword ? "Tutup" : "Lihat"}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full min-h-[44px] py-3 px-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm transition-colors"
                        >
                          Buka Meja Kasir Sekarang
                        </button>
                      </form>
                    ) : (
                      <form
                        id="panel-register"
                        role="tabpanel"
                        aria-labelledby="tab-register"
                        onSubmit={handleRegisterSubmit}
                        className="space-y-3.5"
                      >
                        <div>
                          <h2 className="text-base font-bold text-stone-900 dark:text-white">
                            Registrasi Petugas Kasir Baru
                          </h2>
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                            Buat akun kasir dengan nama Anda sendiri dan tentukan nama kedai.
                          </p>
                        </div>

                        <div>
                          <label
                            htmlFor="reg-name"
                            className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                          >
                            Nama Petugas / Pemilik
                          </label>
                          <input
                            id="reg-name"
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Ketik nama Anda"
                            className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="reg-store"
                            className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                          >
                            Nama Kedai / Toko
                          </label>
                          <input
                            id="reg-store"
                            type="text"
                            required
                            value={regStore}
                            onChange={(e) => setRegStore(e.target.value)}
                            placeholder="Contoh: Kopi & Roti Senja"
                            className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="reg-email"
                            className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                          >
                            Alamat Email
                          </label>
                          <input
                            id="reg-email"
                            type="email"
                            required
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="nama@kedaianda.id"
                            className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label
                              htmlFor="reg-password"
                              className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                            >
                              Kata Sandi
                            </label>
                            <input
                              id="reg-password"
                              type="password"
                              required
                              minLength={6}
                              value={regPassword}
                              onChange={(e) => setRegPassword(e.target.value)}
                              placeholder="Min. 6 karakter"
                              className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="reg-role"
                              className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                            >
                              Jabatan
                            </label>
                            <select
                              id="reg-role"
                              value={regRole}
                              onChange={(e) =>
                                setRegRole(e.target.value as "Kasir Shift" | "Kepala Kedai")
                              }
                              className="w-full min-h-[44px] px-2.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                            >
                              <option value="Kasir Shift">Kasir Shift</option>
                              <option value="Kepala Kedai">Kepala Kedai</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full min-h-[44px] py-3 px-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm transition-colors"
                        >
                          Simpan Akun & Buka Kasir
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <div className="px-6 py-3.5 bg-[#faf8f5] dark:bg-[#12100e] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                  <span>Default: kasir@lokanota.id</span>
                  <span className="font-mono">Sandi: password123</span>
                </div>
              </section>
            </div>
          </main>

          <footer className="w-full py-4 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-600 dark:text-stone-400">
            {storeConfig.brandName} • {storeConfig.branchName} ({storeConfig.address})
          </footer>
        </div>
      </>
    );
  }

  // ============================================================================
  // VIEW 2: SIGNED-IN WORKSPACE WITH TOP COMMAND DECK (NO GENERIC CLONE SIDEBAR)
  // ============================================================================
  return (
    <>
      <Head>
        <title>{`${screenHeading} | ${storeConfig.brandName}`}</title>
        <meta
          name="description"
          content={`Ruang kerja kasir dan inventori ${storeConfig.brandName}.`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 dark:bg-[#12100e] dark:text-stone-100 no-print">
        {/* Top Command Header & Navigation Deck */}
        <header className="sticky top-0 z-30 bg-white dark:bg-[#1c1917] border-b-2 border-stone-200 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
            {/* Brand + Mobile Trigger */}
            <div className="flex items-center gap-3">
              <button
                ref={mobileTriggerRef}
                type="button"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-nav-drawer"
                aria-label="Buka menu navigasi"
                className="lg:hidden min-w-[44px] min-h-[44px] rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center"
              >
                ☰
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className="px-2.5 py-1.5 rounded bg-amber-700 text-white font-mono text-xs font-bold"
                  aria-hidden="true"
                >
                  [NOTA]
                </div>
                <div>
                  <span className="font-bold text-sm sm:text-base tracking-tight block leading-none">
                    {storeConfig.brandName}
                  </span>
                  <span className="text-xs text-stone-600 dark:text-stone-400 block mt-0.5">
                    {storeConfig.branchName}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Command Navigation Bar */}
            <nav
              aria-label="Menu Utama Kasir"
              className="hidden lg:flex items-center gap-1.5"
            >
              {(
                [
                  { id: "pos", label: "Meja Kasir", badge: totalItemsInCart },
                  { id: "transactions", label: "Buku Nota", badge: transactions.length },
                  { id: "products", label: "Gudang Menu", badge: products.length },
                  { id: "customers", label: "Pelanggan", badge: customers.length },
                  { id: "settings", label: "Identitas Kedai", badge: null },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  aria-current={activeTab === item.id ? "page" : undefined}
                  className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
                    activeTab === item.id
                      ? "bg-amber-700 text-white"
                      : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={`px-1.5 py-0.5 text-[11px] font-mono rounded tabular-nums ${
                        activeTab === item.id
                          ? "bg-amber-900 text-white"
                          : "bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Right Controls: Theme, User Badge, Logout */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                aria-label={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                className="min-w-[44px] min-h-[44px] rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center transition-colors"
              >
                {theme === "dark" ? (
                  <svg
                    className="w-5 h-5 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-stone-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span
                  className="w-7 h-7 rounded bg-amber-700 text-white text-xs font-bold flex items-center justify-center"
                  aria-hidden="true"
                >
                  {getInitials(currentUser.name)}
                </span>
                <span className="text-xs font-semibold max-w-[110px] truncate">
                  {currentUser.name}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="min-h-[44px] px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-800 dark:text-red-200 text-xs font-semibold"
              >
                Tutup Shift
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Navigasi Mobile"
            className="fixed inset-0 z-50 lg:hidden flex"
          >
            <div
              className="fixed inset-0 bg-stone-950/60"
              onClick={() => {
                setMobileNavOpen(false);
                mobileTriggerRef.current?.focus();
              }}
            />
            <div className="relative z-10 w-72 max-w-[85vw] bg-white dark:bg-[#1c1917] h-full border-r border-stone-200 dark:border-stone-800 flex flex-col justify-between p-4">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
                  <span className="font-bold text-base">{storeConfig.brandName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      mobileTriggerRef.current?.focus();
                    }}
                    aria-label="Tutup menu navigasi"
                    className="min-w-[44px] min-h-[44px] rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  {(
                    [
                      { id: "pos", label: "Meja Kasir", badge: totalItemsInCart },
                      { id: "transactions", label: "Buku Nota", badge: transactions.length },
                      { id: "products", label: "Gudang Menu", badge: products.length },
                      { id: "customers", label: "Pelanggan", badge: customers.length },
                      { id: "settings", label: "Identitas Kedai", badge: null },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileNavOpen(false);
                        mobileTriggerRef.current?.focus();
                      }}
                      className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-lg flex items-center justify-between text-sm font-bold ${
                        activeTab === item.id
                          ? "bg-amber-700 text-white"
                          : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.badge !== null && (
                        <span className="px-2 py-0.5 text-xs font-mono rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 tabular-nums">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-400">
                <p className="font-semibold text-stone-900 dark:text-stone-200">
                  Petugas: {currentUser.name}
                </p>
                <p>{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Toast Feedback Banner */}
        {statusBanner && (
          <div
            role="status"
            aria-live="polite"
            className="bg-amber-800 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between"
          >
            <span>{statusBanner}</span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              className="min-w-[44px] min-h-[32px] underline text-xs ml-4"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main id="main-workspace" className="flex-1 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Screen Heading Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
                  {screenHeading}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 mt-0.5">
                  {activeTab === "pos" &&
                    `Pilih menu di etalase kiri, periksa lembar nota di kanan, lalu proses pembayaran.`}
                  {activeTab === "transactions" &&
                    "Daftar seluruh nota penjualan yang telah diselesaikan pada sesi kasir."}
                  {activeTab === "products" &&
                    "Atur nama menu, kategori, kode barang, harga jual, dan jumlah stok."}
                  {activeTab === "customers" &&
                    "Simpan data pelanggan tetap untuk pencatatan nota dan potongan harga."}
                  {activeTab === "settings" &&
                    "Ganti nama aplikasi, nama kedai, alamat, dan pesan kaki nota sesuai usaha Anda."}
                </p>
              </div>

              {activeTab === "products" && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCatalog}
                    className="min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 text-xs font-semibold"
                  >
                    Reset 6 Menu Awal
                  </button>
                  <button
                    type="button"
                    onClick={openAddProductModal}
                    className="min-h-[44px] px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold"
                  >
                    + Tambah Menu Baru
                  </button>
                </div>
              )}

              {activeTab === "customers" && (
                <button
                  type="button"
                  onClick={openAddCustomerModal}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold self-start sm:self-auto"
                >
                  + Tambah Pelanggan
                </button>
              )}
            </div>

            {/* R-27: Loading & Error States */}
            {systemState === "loading" && (
              <div
                role="status"
                className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center space-y-4"
              >
                <h2 className="text-base font-bold">Memuat data buku nota dan daftar menu...</h2>
                <button
                  type="button"
                  onClick={() => setSystemState("ready")}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold"
                >
                  Lanjutkan ke Kasir
                </button>
              </div>
            )}

            {systemState === "error" && (
              <div
                role="alert"
                className="bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-xl p-6 text-center space-y-3"
              >
                <h2 className="text-base font-bold text-red-900 dark:text-red-200">
                  Gangguan Penyimpanan Lokal
                </h2>
                <p className="text-xs text-red-800 dark:text-red-300">{errorReason}</p>
                <button
                  type="button"
                  onClick={() => setSystemState("ready")}
                  className="min-h-[44px] px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold"
                >
                  Pulihkan Meja Kasir
                </button>
              </div>
            )}

            {/* =================================================================
                TAB 1: MEJA KASIR (POS)
               ================================================================= */}
            {systemState === "ready" && activeTab === "pos" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column (7 cols): Etalase Menu */}
                <section
                  aria-label="Etalase Menu Kedai"
                  className="lg:col-span-7 xl:col-span-8 space-y-4"
                >
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-3">
                    <div>
                      <label
                        htmlFor="pos-search"
                        className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
                      >
                        Cari Menu (Nama atau Kode Barang)
                      </label>
                      <div className="flex gap-2">
                        <input
                          ref={posSearchInputRef}
                          id="pos-search"
                          type="search"
                          value={posSearch}
                          onChange={(e) => setPosSearch(e.target.value)}
                          placeholder="Ketik nama roti/minuman atau BKR-001..."
                          className="flex-1 min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                        />
                        {posSearch && (
                          <button
                            type="button"
                            onClick={() => setPosSearch("")}
                            className="min-h-[44px] px-3 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1" role="group" aria-label="Filter kategori menu">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setPosCategory(cat)}
                          aria-pressed={posCategory === cat}
                          className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                            posCategory === cat
                              ? "bg-amber-700 text-white"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredPosProducts.length === 0 ? (
                    <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center space-y-3">
                      <h2 className="text-base font-bold">Menu Tidak Ditemukan</h2>
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                        Tidak ada menu yang cocok dengan filter &ldquo;{posSearch || posCategory}
                        &rdquo;. Reset filter atau tambahkan menu baru di Gudang Menu.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setPosSearch("");
                          setPosCategory("Semua");
                        }}
                        className="min-h-[44px] px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold"
                      >
                        Tampilkan Semua Menu
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredPosProducts.map((product, index) => {
                        const inCart = cart.find((c) => c.product.id === product.id);
                        const isOutOfStock = product.stock <= 0;
                        return (
                          <article
                            key={product.id}
                            className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-amber-700/60 transition-colors"
                          >
                            <div>
                              <div className="relative h-40 w-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                                <img
                                  src={product.img}
                                  alt={product.productname}
                                  width={320}
                                  height={200}
                                  fetchPriority={index < 2 ? "high" : "auto"}
                                  loading={index < 2 ? "eager" : "lazy"}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-900/85 text-white font-mono text-[11px] font-bold">
                                  {product.sku}
                                </div>
                                <div
                                  className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[11px] font-bold ${
                                    isOutOfStock
                                      ? "bg-red-700 text-white"
                                      : product.stock <= 5
                                      ? "bg-amber-600 text-white"
                                      : "bg-stone-900/85 text-white"
                                  }`}
                                >
                                  {isOutOfStock ? "Habis" : `Sisa: ${product.stock}`}
                                </div>
                              </div>

                              <div className="p-4">
                                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block mb-1">
                                  {product.category}
                                </span>
                                <h2 className="text-sm font-bold text-stone-900 dark:text-white leading-snug">
                                  {product.productname}
                                </h2>
                                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-2">
                                  {product.description}
                                </p>
                              </div>
                            </div>

                            <div className="px-4 pb-4 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                                  Harga
                                </span>
                                <span className="text-base font-bold text-stone-900 dark:text-white font-mono tabular-nums">
                                  {formatRupiah(product.price)}
                                </span>
                              </div>

                              <button
                                type="button"
                                disabled={isOutOfStock}
                                onClick={() => addToCart(product)}
                                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                                  isOutOfStock
                                    ? "bg-stone-200 dark:bg-stone-800 text-stone-500"
                                    : inCart
                                    ? "bg-amber-900 dark:bg-amber-600 text-white"
                                    : "bg-amber-700 hover:bg-amber-800 text-white"
                                }`}
                              >
                                {isOutOfStock
                                  ? "Habis"
                                  : inCart
                                  ? `+ Tambah (${inCart.quantity})`
                                  : "+ Catat Nota"}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Right Column (5 cols): Lembar Nota Pesanan (Stamped Paper Ledger Motif) */}
                <aside
                  id="active-receipt-panel"
                  aria-label="Lembar Nota Pesanan Aktif"
                  className="lg:col-span-5 xl:col-span-4 bg-white dark:bg-[#1c1917] border-2 border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden lg:sticky lg:top-20"
                >
                  <div className="bg-amber-700 px-4 py-3.5 text-white flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold tracking-wide uppercase">
                        Lembar Nota Pesanan
                      </h2>
                      <p className="text-xs text-amber-100 font-mono">
                        Petugas: {currentUser.name}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-900 font-mono text-xs font-bold tabular-nums">
                      {totalItemsInCart} Porsi
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="pos-customer-select"
                          className="text-xs font-semibold text-stone-700 dark:text-stone-300"
                        >
                          Nama Pelanggan di Nota
                        </label>
                        <button
                          type="button"
                          onClick={openAddCustomerModal}
                          className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline"
                        >
                          + Pelanggan Baru
                        </button>
                      </div>
                      <select
                        id="pos-customer-select"
                        value={selectedCustomerId ?? ""}
                        onChange={(e) =>
                          setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-xs sm:text-sm"
                      >
                        <option value="">Pelanggan Umum (Langsung)</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="border-t border-b border-dashed border-stone-300 dark:border-stone-700 py-3 max-h-[320px] overflow-y-auto space-y-3">
                      {cart.length === 0 ? (
                        <div className="py-6 text-center space-y-2.5">
                          <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                            Lembar Nota Masih Kosong
                          </p>
                          <p className="text-xs text-stone-600 dark:text-stone-400 px-2">
                            Klik tombol &ldquo;+ Catat Nota&rdquo; pada kartu menu di sebelah kiri
                            untuk menambahkan pesanan.
                          </p>
                          <button
                            type="button"
                            onClick={() => posSearchInputRef.current?.focus()}
                            className="min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                          >
                            Cari Menu Pesanan
                          </button>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center justify-between gap-2 pb-2.5 border-b border-stone-100 dark:border-stone-800 last:border-b-0 last:pb-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                                {item.product.productname}
                              </p>
                              <p className="text-xs text-stone-600 dark:text-stone-400 font-mono tabular-nums">
                                {formatRupiah(item.product.price)} × {item.quantity} ={" "}
                                <strong className="text-stone-900 dark:text-white">
                                  {formatRupiah(item.product.price * item.quantity)}
                                </strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, -1)}
                                aria-label={`Kurangi ${item.product.productname}`}
                                className="min-w-[44px] min-h-[44px] rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold text-sm flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="w-7 text-center font-mono text-xs font-bold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.product.id, 1)}
                                aria-label={`Tambah ${item.product.productname}`}
                                className="min-w-[44px] min-h-[44px] rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold text-sm flex items-center justify-center"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product.id)}
                                aria-label={`Hapus ${item.product.productname}`}
                                className="min-w-[44px] min-h-[44px] rounded-lg text-red-700 dark:text-red-400 text-xs font-bold flex items-center justify-center"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="pos-discount-select"
                          className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                        >
                          Potongan Harga
                        </label>
                        <select
                          id="pos-discount-select"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(Number(e.target.value))}
                          className="w-full min-h-[44px] px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-xs font-semibold"
                        >
                          <option value={0}>Normal (0%)</option>
                          <option value={5}>Pelanggan Tetap (5%)</option>
                          <option value={10}>Diskon Kedai (10%)</option>
                          <option value={15}>Paket Khusus (15%)</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="pos-tax-select"
                          className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                        >
                          Pajak PB1 / PPN
                        </label>
                        <select
                          id="pos-tax-select"
                          value={taxEnabled ? "yes" : "no"}
                          onChange={(e) => setTaxEnabled(e.target.value === "yes")}
                          className="w-full min-h-[44px] px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-xs font-semibold"
                        >
                          <option value="no">Tanpa Pajak</option>
                          <option value="yes">Pajak 11%</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-[#faf8f5] dark:bg-[#12100e] p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-600 dark:text-stone-400">
                        <span>Subtotal</span>
                        <span className="font-mono font-semibold tabular-nums">
                          {formatRupiah(cartSubtotal)}
                        </span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-amber-800 dark:text-amber-400">
                          <span>Potongan ({discountPercent}%)</span>
                          <span className="font-mono font-semibold tabular-nums">
                            - {formatRupiah(discountAmount)}
                          </span>
                        </div>
                      )}
                      {taxEnabled && (
                        <div className="flex justify-between text-stone-600 dark:text-stone-400">
                          <span>Pajak (11%)</span>
                          <span className="font-mono font-semibold tabular-nums">
                            + {formatRupiah(taxAmount)}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex justify-between items-baseline">
                        <span className="text-sm font-bold">Total Tagihan</span>
                        <span className="text-lg font-bold text-amber-800 dark:text-amber-400 font-mono tabular-nums">
                          {formatRupiah(cartGrandTotal)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={cart.length === 0}
                        onClick={clearCart}
                        className="min-h-[44px] px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold disabled:opacity-50"
                      >
                        Kosongkan
                      </button>
                      <button
                        type="button"
                        disabled={cart.length === 0}
                        onClick={openPaymentModal}
                        className="flex-1 min-h-[44px] py-2.5 px-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm transition-colors disabled:opacity-50 tabular-nums"
                      >
                        Tagih & Cetak Nota ({formatRupiah(cartGrandTotal)})
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {/* =================================================================
                TAB 2: BUKU ARSIP NOTA PENJUALAN
               ================================================================= */}
            {systemState === "ready" && activeTab === "transactions" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-4">
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 block">
                      Jumlah Nota Selesai
                    </span>
                    <span className="text-2xl font-bold font-mono tabular-nums mt-1 block">
                      {transactions.length} Nota
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-4">
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 block">
                      Total Kas Masuk
                    </span>
                    <span className="text-2xl font-bold text-amber-800 dark:text-amber-400 font-mono tabular-nums mt-1 block">
                      {formatRupiah(totalRevenueRecorded)}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-4">
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 block">
                      Total Porsi Terjual
                    </span>
                    <span className="text-2xl font-bold font-mono tabular-nums mt-1 block">
                      {totalUnitsSold} Porsi
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="tx-search"
                      className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                    >
                      Cari Nomor Nota / Pelanggan / Kasir
                    </label>
                    <input
                      id="tx-search"
                      type="search"
                      value={txSearch}
                      onChange={(e) => setTxSearch(e.target.value)}
                      placeholder="Ketik NOTA-... atau nama pelanggan"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tx-method-filter"
                      className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                    >
                      Metode Pembayaran
                    </label>
                    <select
                      id="tx-method-filter"
                      value={txMethodFilter}
                      onChange={(e) => setTxMethodFilter(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                    >
                      <option value="Semua">Semua Metode</option>
                      <option value="Tunai">Tunai</option>
                      <option value="QRIS">QRIS</option>
                      <option value="Kartu Debit">Kartu Debit</option>
                    </select>
                  </div>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center space-y-3">
                    <h2 className="text-base font-bold">Buku Nota Masih Kosong</h2>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                      Belum ada transaksi yang diselesaikan. Silakan catat pesanan pelanggan di Meja
                      Kasir untuk menerbitkan nota pertama.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("pos")}
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-amber-700 text-white text-xs sm:text-sm font-bold"
                    >
                      Ke Meja Kasir
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                            <th className="py-3.5 px-4 font-bold">Nomor Nota & Waktu</th>
                            <th className="py-3.5 px-4 font-bold">Pelanggan & Petugas</th>
                            <th className="py-3.5 px-4 font-bold">Item Pesanan</th>
                            <th className="py-3.5 px-4 font-bold">Pembayaran</th>
                            <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                          {filteredTransactions.map((tx) => (
                            <tr key={tx.id}>
                              <td className="py-3.5 px-4 align-top">
                                <span className="font-mono font-bold text-amber-800 dark:text-amber-400 block">
                                  {tx.invoiceNo}
                                </span>
                                <span className="text-xs text-stone-500">
                                  {new Date(tx.createdAt).toLocaleString("id-ID")}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                <span className="font-bold block">{tx.customerName}</span>
                                <span className="text-xs text-stone-500">
                                  Petugas: {tx.cashierName}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 align-top">
                                <ul className="space-y-0.5 text-xs">
                                  {tx.items.map((line, i) => (
                                    <li key={i}>
                                      {line.quantity}× {line.productname} (
                                      {formatRupiah(line.subtotal)})
                                    </li>
                                  ))}
                                </ul>
                              </td>
                              <td className="py-3.5 px-4 align-top tabular-nums">
                                <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded bg-stone-200 dark:bg-stone-800 mb-1">
                                  {tx.paymentMethod}
                                </span>
                                <span className="font-mono font-bold block text-sm">
                                  {formatRupiah(tx.totalAmount)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 align-top text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setActiveReceipt(tx)}
                                    className="min-h-[44px] px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold"
                                  >
                                    Buka Nota
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTransaction(tx)}
                                    className="min-h-[44px] px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                TAB 3: GUDANG MENU & DAFTAR HARGA
               ================================================================= */}
            {systemState === "ready" && activeTab === "products" && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-4">
                  <label
                    htmlFor="inv-search"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Cari Menu di Gudang
                  </label>
                  <input
                    id="inv-search"
                    type="search"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Ketik nama menu atau kode BKR-..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                  />
                </div>

                <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                          <th className="py-3.5 px-4 font-bold">Menu & Kode</th>
                          <th className="py-3.5 px-4 font-bold">Kategori</th>
                          <th className="py-3.5 px-4 font-bold">Harga Jual</th>
                          <th className="py-3.5 px-4 font-bold">Stok</th>
                          <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                        {filteredInventory.map((prod) => (
                          <tr key={prod.id}>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.img}
                                  alt={prod.productname}
                                  width={48}
                                  height={48}
                                  loading="lazy"
                                  className="w-12 h-12 rounded-lg object-cover bg-stone-200 shrink-0"
                                />
                                <div>
                                  <span className="font-mono text-xs text-stone-500 block">
                                    {prod.sku}
                                  </span>
                                  <span className="font-bold block">{prod.productname}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-medium">{prod.category}</td>
                            <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                              {formatRupiah(prod.price)}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                              {prod.stock} Unit
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditProductModal(prod)}
                                  className="min-h-[44px] px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                                >
                                  Ubah
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod)}
                                  className="min-h-[44px] px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================================
                TAB 4: BUKU PELANGGAN KEDAI
               ================================================================= */}
            {systemState === "ready" && activeTab === "customers" && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-4">
                  <label
                    htmlFor="cust-search"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Cari Pelanggan
                  </label>
                  <input
                    id="cust-search"
                    type="search"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Ketik nama pelanggan atau nomor telepon..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                  />
                </div>

                {filteredCustomers.length === 0 ? (
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center space-y-3">
                    <h2 className="text-base font-bold">Belum Ada Pelanggan Terdaftar</h2>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
                      Catat pelanggan langganan kedai Anda untuk memudahkan pencatatan nota.
                    </p>
                    <button
                      type="button"
                      onClick={openAddCustomerModal}
                      className="min-h-[44px] px-4 py-2 rounded-lg bg-amber-700 text-white text-xs font-bold"
                    >
                      + Tambah Pelanggan Pertama
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                            <th className="py-3.5 px-4 font-bold">Nama Pelanggan</th>
                            <th className="py-3.5 px-4 font-bold">Kontak</th>
                            <th className="py-3.5 px-4 font-bold">Riwayat Belanja</th>
                            <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                          {filteredCustomers.map((cust) => {
                            const count = transactions.filter((t) => t.customerId === cust.id).length;
                            return (
                              <tr key={cust.id}>
                                <td className="py-3.5 px-4 font-bold">{cust.name}</td>
                                <td className="py-3.5 px-4">
                                  <span className="block">{cust.email}</span>
                                  <span className="text-xs font-mono text-stone-500">
                                    {cust.phone}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                                  {count} Nota
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedCustomerId(cust.id);
                                        setActiveTab("pos");
                                        showFeedback(`Pelanggan "${cust.name}" dipasang ke nota.`);
                                      }}
                                      className="min-h-[44px] px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold"
                                    >
                                      Pakai di Nota
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openEditCustomerModal(cust)}
                                      className="min-h-[44px] px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                                    >
                                      Ubah
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCustomer(cust)}
                                      className="min-h-[44px] px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================================
                TAB 5: PENGATURAN IDENTITAS KEDAI & STRUK (Custom Brand/Name!)
               ================================================================= */}
            {systemState === "ready" && activeTab === "settings" && (
              <div className="max-w-2xl bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-xl p-6 space-y-5">
                <div>
                  <h2 className="text-base font-bold">Kustomisasi Nama Aplikasi & Kop Struk</h2>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    Anda bebas mengubah nama brand kasir, nama kedai, alamat cabang, dan pesan
                    penutup pada cetakan struk di bawah ini.
                  </p>
                </div>

                <form onSubmit={handleSaveStoreConfig} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="cfg-brand"
                        className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                      >
                        Nama Aplikasi Kasir
                      </label>
                      <input
                        id="cfg-brand"
                        type="text"
                        required
                        value={cfgBrand}
                        onChange={(e) => setCfgBrand(e.target.value)}
                        placeholder="Contoh: LokaNota"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cfg-branch"
                        className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                      >
                        Nama Toko / Kedai (Kop Nota)
                      </label>
                      <input
                        id="cfg-branch"
                        type="text"
                        required
                        value={cfgBranch}
                        onChange={(e) => setCfgBranch(e.target.value)}
                        placeholder="Contoh: Kedai Artisan & Bakery"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cfg-tagline"
                      className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                    >
                      Subjudul Sistem
                    </label>
                    <input
                      id="cfg-tagline"
                      type="text"
                      required
                      value={cfgTagline}
                      onChange={(e) => setCfgTagline(e.target.value)}
                      placeholder="Contoh: Sistem Kasir & Buku Nota Kedai"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cfg-address"
                      className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                    >
                      Alamat Kedai (Dicetak di Nota)
                    </label>
                    <input
                      id="cfg-address"
                      type="text"
                      required
                      value={cfgAddress}
                      onChange={(e) => setCfgAddress(e.target.value)}
                      placeholder="Contoh: Jl. Raya Utama No. 18"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="cfg-footer"
                      className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                    >
                      Pesan Kaki Struk
                    </label>
                    <input
                      id="cfg-footer"
                      type="text"
                      required
                      value={cfgFooter}
                      onChange={(e) => setCfgFooter(e.target.value)}
                      placeholder="Terima kasih atas kunjungan Anda!"
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold"
                  >
                    Simpan Identitas Kedai
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-3 px-6 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-600 dark:text-stone-400">
          <span>
            {storeConfig.brandName} • {storeConfig.branchName}
          </span>
          <span>{storeConfig.address}</span>
        </footer>
      </div>

      {/* =====================================================================
          MODAL 1: PEMBAYARAN KASIR
         ===================================================================== */}
      {paymentModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 no-print"
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 bg-amber-700 text-white flex items-center justify-between">
              <h2 id="payment-modal-title" className="text-base font-bold">
                Penyelesaian Tagihan Nota
              </h2>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                aria-label="Tutup jendela pembayaran"
                className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-amber-800 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompletePayment} className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-[#faf8f5] dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <span className="text-sm font-semibold">Total Tagihan</span>
                <span className="text-xl font-bold font-mono text-amber-800 dark:text-amber-400 tabular-nums">
                  {formatRupiah(cartGrandTotal)}
                </span>
              </div>

              {paymentError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-xs font-medium text-red-800 dark:text-red-200"
                >
                  {paymentError}
                </div>
              )}

              <div>
                <label
                  htmlFor="pay-method-select"
                  className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1.5"
                >
                  Metode Pembayaran
                </label>
                <select
                  id="pay-method-select"
                  value={paymentMethod}
                  onChange={(e) => {
                    const m = e.target.value as "Tunai" | "QRIS" | "Kartu Debit";
                    setPaymentMethod(m);
                    if (m !== "Tunai") {
                      setAmountPaidInput(String(cartGrandTotal));
                    }
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm font-semibold"
                >
                  <option value="Tunai">Uang Tunai</option>
                  <option value="QRIS">QRIS Kedai</option>
                  <option value="Kartu Debit">Kartu Debit / Transfer</option>
                </select>
              </div>

              {paymentMethod === "Tunai" && (
                <div className="space-y-2">
                  <label
                    htmlFor="pay-cash-input"
                    className="block text-xs font-semibold text-stone-800 dark:text-stone-200"
                  >
                    Uang Diterima (Rp)
                  </label>
                  <input
                    id="pay-cash-input"
                    type="number"
                    required
                    min={0}
                    value={amountPaidInput}
                    onChange={(e) => setAmountPaidInput(e.target.value)}
                    placeholder="Nominal uang pelanggan"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-base font-mono font-bold tabular-nums"
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { label: "Uang Pas", val: cartGrandTotal },
                      { label: "Rp 20.000", val: 20000 },
                      { label: "Rp 50.000", val: 50000 },
                      { label: "Rp 100.000", val: 100000 },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        type="button"
                        onClick={() => setAmountPaidInput(String(btn.val))}
                        className="min-h-[44px] px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-xs font-semibold tabular-nums"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-[#faf8f5] dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-semibold">Uang Kembalian:</span>
                    <span className="font-mono font-bold text-base tabular-nums text-amber-800 dark:text-amber-400">
                      {Number(amountPaidInput || 0) >= cartGrandTotal
                        ? formatRupiah(Number(amountPaidInput || 0) - cartGrandTotal)
                        : "Uang belum cukup"}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="pay-note-input"
                  className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1"
                >
                  Catatan Pesanan (Opsional)
                </label>
                <input
                  id="pay-note-input"
                  type="text"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Contoh: Makan di tempat / Bawa pulang"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs sm:text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold"
                >
                  Simpan & Cetak Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: CETAK NOTA TERMAL
         ===================================================================== */}
      {activeReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75"
        >
          <div className="w-full max-w-md bg-white text-stone-900 rounded-2xl overflow-hidden shadow-xl border border-stone-300">
            <div id="printable-receipt" className="p-6 space-y-4 font-mono text-xs">
              <div className="text-center border-b border-dashed border-stone-400 pb-3">
                <h2 id="receipt-modal-title" className="text-base font-bold uppercase">
                  {activeReceipt.storeName}
                </h2>
                <p className="text-[11px] text-stone-600">{storeConfig.address}</p>
                <p className="text-[11px] mt-1 font-bold">{activeReceipt.invoiceNo}</p>
                <p className="text-[11px]">
                  {new Date(activeReceipt.createdAt).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-stone-400 pb-3">
                <div className="flex justify-between">
                  <span>Petugas:</span>
                  <span className="font-bold">{activeReceipt.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold">{activeReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pembayaran:</span>
                  <span className="font-bold">{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="space-y-2 border-b border-dashed border-stone-400 pb-3">
                {activeReceipt.items.map((line, idx) => (
                  <div key={idx} className="flex justify-between gap-2 tabular-nums">
                    <div>
                      <span className="font-bold block">{line.productname}</span>
                      <span className="text-[11px] text-stone-600">
                        {line.quantity} × {formatRupiah(line.price)}
                      </span>
                    </div>
                    <span className="font-bold">{formatRupiah(line.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 tabular-nums border-b border-dashed border-stone-400 pb-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(activeReceipt.subtotal)}</span>
                </div>
                {activeReceipt.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Potongan ({activeReceipt.discountPercent}%)</span>
                    <span>- {formatRupiah(activeReceipt.discountAmount)}</span>
                  </div>
                )}
                {activeReceipt.taxEnabled && (
                  <div className="flex justify-between">
                    <span>Pajak (11%)</span>
                    <span>+ {formatRupiah(activeReceipt.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-1">
                  <span>TOTAL</span>
                  <span>{formatRupiah(activeReceipt.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diterima</span>
                  <span>{formatRupiah(activeReceipt.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Kembalian</span>
                  <span>{formatRupiah(activeReceipt.changeAmount)}</span>
                </div>
              </div>

              {activeReceipt.note && (
                <p className="text-[11px] italic">Catatan: {activeReceipt.note}</p>
              )}

              <div className="text-center text-[11px] pt-1">
                <p className="font-bold">{storeConfig.receiptFooter}</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 min-h-[44px] py-2 px-4 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
              >
                Cetak Nota (Print)
              </button>
              <button
                type="button"
                onClick={() => setActiveReceipt(null)}
                className="min-h-[44px] py-2 px-4 rounded-lg border border-stone-300 bg-white text-stone-800 text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: TAMBAH / UBAH MENU
         ===================================================================== */}
      {productModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 no-print"
        >
          <div className="w-full max-w-lg bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 bg-amber-700 text-white flex items-center justify-between">
              <h2 id="product-modal-title" className="text-base font-bold">
                {editingProduct ? "Ubah Data Menu" : "Tambah Menu Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                aria-label="Tutup formulir menu"
                className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-amber-800 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {prodFormError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-300 text-xs font-medium text-red-800"
                >
                  {prodFormError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="prod-name-input"
                    className="block text-xs font-semibold mb-1"
                  >
                    Nama Menu
                  </label>
                  <input
                    id="prod-name-input"
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Contoh: Kopi Susu Gula Aren"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prod-sku-input"
                    className="block text-xs font-semibold mb-1"
                  >
                    Kode Barang
                  </label>
                  <input
                    id="prod-sku-input"
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    placeholder="BKR-007"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="prod-cat-input"
                    className="block text-xs font-semibold mb-1"
                  >
                    Kategori
                  </label>
                  <input
                    id="prod-cat-input"
                    type="text"
                    required
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    placeholder="Minuman Kopi"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prod-price-input"
                    className="block text-xs font-semibold mb-1"
                  >
                    Harga Jual (Rp)
                  </label>
                  <input
                    id="prod-price-input"
                    type="number"
                    required
                    min={100}
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="18000"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="prod-stock-input"
                    className="block text-xs font-semibold mb-1"
                  >
                    Stok Tersedia
                  </label>
                  <input
                    id="prod-stock-input"
                    type="number"
                    required
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="25"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm font-mono tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="prod-img-select"
                  className="block text-xs font-semibold mb-1"
                >
                  Foto Produk
                </label>
                <select
                  id="prod-img-select"
                  value={prodImg}
                  onChange={(e) => setProdImg(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                >
                  {ASSET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="prod-desc-input"
                  className="block text-xs font-semibold mb-1"
                >
                  Keterangan Singkat
                </label>
                <textarea
                  id="prod-desc-input"
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Keterangan rasa atau ukuran porsi..."
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 4: TAMBAH / UBAH PELANGGAN
         ===================================================================== */}
      {customerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 no-print"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 bg-amber-700 text-white flex items-center justify-between">
              <h2 id="customer-modal-title" className="text-base font-bold">
                {editingCustomer ? "Ubah Data Pelanggan" : "Catat Pelanggan Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                aria-label="Tutup formulir pelanggan"
                className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-amber-800 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              {custFormError && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-300 text-xs font-medium text-red-800"
                >
                  {custFormError}
                </div>
              )}

              <div>
                <label
                  htmlFor="cust-name-input"
                  className="block text-xs font-semibold mb-1"
                >
                  Nama Pelanggan
                </label>
                <input
                  id="cust-name-input"
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Ketik nama pelanggan"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="cust-email-input"
                  className="block text-xs font-semibold mb-1"
                >
                  Email
                </label>
                <input
                  id="cust-email-input"
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="pelanggan@email.com"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="cust-phone-input"
                  className="block text-xs font-semibold mb-1"
                >
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  id="cust-phone-input"
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#12100e] text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
