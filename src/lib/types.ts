export type NavTab = "pos" | "transactions" | "products" | "customers" | "settings";

export interface StoreConfig {
  brandName: string;
  tagline: string;
  branchName: string;
  address: string;
  receiptFooter: string;
}

export interface UserAccount {
  id: string;
  name: string;
  storeName: string;
  email: string;
  password: string;
  role: "Kasir Shift" | "Kepala Kedai";
}

export interface ProductItem {
  id: number;
  sku: string;
  category: string;
  productname: string;
  description: string;
  price: number;
  stock: number;
  img: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface CustomerItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface TransactionLine {
  productId: number;
  sku: string;
  productname: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface TransactionRecord {
  id: string;
  invoiceNo: string;
  createdAt: string;
  cashierName: string;
  storeName: string;
  customerName: string;
  customerId: number | null;
  items: TransactionLine[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxEnabled: boolean;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: "Tunai" | "QRIS" | "Kartu Debit";
  amountPaid: number;
  changeAmount: number;
  note: string;
}

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  brandName: "LokaNota",
  tagline: "Sistem Kasir & Buku Nota Kedai",
  branchName: "Kedai Artisan & Bakery",
  address: "Jl. Raya Utama No. 18",
  receiptFooter: "Barang yang sudah dibeli tidak dapat ditukar. Terima kasih!",
};

export const ASSET_OPTIONS = [
  {
    label: "Almond Croissant (/asset/almond-croissant-cookie-recipe-27.webp)",
    value: "/asset/almond-croissant-cookie-recipe-27.webp",
  },
  {
    label: "Roastbeef Croissant (/asset/Roastbeef-croissants-portrait.jpg)",
    value: "/asset/Roastbeef-croissants-portrait.jpg",
  },
  {
    label: "Berry Cream Croissant (/asset/images.jpeg)",
    value: "/asset/images.jpeg",
  },
  {
    label: "Sugar Croissant (/asset/chocolate-croissants-2-300x450.webp)",
    value: "/asset/chocolate-croissants-2-300x450.webp",
  },
  {
    label: "Chocochips Croissant (/asset/IMG_0792.webp)",
    value: "/asset/IMG_0792.webp",
  },
  {
    label: "Classic Butter Croissant (/asset/Croissants-20.webp)",
    value: "/asset/Croissants-20.webp",
  },
];

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    sku: "BKR-001",
    category: "Pastry Manis",
    productname: "Almond Brown Sugar Croissant",
    description: "Croissant renyah dengan taburan kacang almond panggang dan gula aren",
    price: 12000,
    stock: 24,
    img: "/asset/almond-croissant-cookie-recipe-27.webp",
  },
  {
    id: 2,
    sku: "BKR-002",
    category: "Pastry Gurih",
    productname: "Smoke Tenderloin Slice Croissant",
    description: "Croissant gurih isi irisan daging sapi asap dan sayuran segar",
    price: 10000,
    stock: 18,
    img: "/asset/Roastbeef-croissants-portrait.jpg",
  },
  {
    id: 3,
    sku: "BKR-003",
    category: "Pastry Manis",
    productname: "Berry Whipped Cream Croissant",
    description: "Croissant manis dengan isian krim kocok, blueberry, dan stroberi",
    price: 8000,
    stock: 15,
    img: "/asset/images.jpeg",
  },
  {
    id: 4,
    sku: "BKR-004",
    category: "Klasik",
    productname: "Sweet Granulated Sugar Croissant",
    description: "Croissant klasik dengan lapisan gula pasir karamel tipis",
    price: 5000,
    stock: 30,
    img: "/asset/chocolate-croissants-2-300x450.webp",
  },
  {
    id: 5,
    sku: "BKR-005",
    category: "Pastry Manis",
    productname: "Sweet Chocolate Chocochips Croissant",
    description: "Croissant berlapis cokelat leleh dan taburan chocochips pekat",
    price: 22000,
    stock: 12,
    img: "/asset/IMG_0792.webp",
  },
  {
    id: 6,
    sku: "BKR-006",
    category: "Klasik",
    productname: "Basic Croissant La Ta Dhore",
    description: "Croissant mentega Perancis panggang segar untuk teman minum kopi",
    price: 8000,
    stock: 20,
    img: "/asset/Croissants-20.webp",
  },
];

export const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: "usr-default-1",
    name: "Admin Kasir",
    storeName: "Kedai Artisan & Bakery",
    email: "kasir@lokanota.id",
    password: "password123",
    role: "Kepala Kedai",
  },
];

export function formatRupiah(amount: number): string {
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "LN";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
