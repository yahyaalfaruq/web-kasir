import { describe, it, expect } from "vitest";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_ACCOUNTS,
  DEFAULT_STORE_CONFIG,
  formatRupiah,
  getInitials,
} from "../src/lib/types";

describe("LokaNota POS Core Logic & Data Integrity", () => {
  it("formats Rupiah values accurately with tabular-ready separators", () => {
    expect(formatRupiah(12000)).toContain("12.000");
    expect(formatRupiah(0)).toBe("Rp 0");
  });

  it("extracts 2-letter uppercase initials for cashier avatar", () => {
    expect(getInitials("Admin Kasir")).toBe("AK");
    expect(getInitials("Kasir")).toBe("KA");
  });

  it("provides 6 real initial products with valid BKR SKU, price, stock, and local asset paths", () => {
    expect(DEFAULT_PRODUCTS).toHaveLength(6);
    for (const prod of DEFAULT_PRODUCTS) {
      expect(prod.sku).toMatch(/^BKR-\d{3}$/);
      expect(prod.price).toBeGreaterThan(0);
      expect(prod.stock).toBeGreaterThan(0);
      expect(prod.img.startsWith("/asset/")).toBe(true);
    }
  });

  it("uses LokaNota brand identity and customizable store config", () => {
    expect(DEFAULT_STORE_CONFIG.brandName).toBe("LokaNota");
    expect(DEFAULT_ACCOUNTS[0].email).toBe("kasir@lokanota.id");
  });
});
