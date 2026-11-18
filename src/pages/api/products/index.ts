import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const INITIAL_PRODUCTS = [
  {
    id: 1,
    sku: "CRS-001",
    category: "Croissant",
    productname: "Almond Brown Sugar Croissant",
    description: "Croissant renyah dengan taburan kacang almond panggang dan gula aren",
    price: 12000,
    stock: 24,
    img: "/asset/almond-croissant-cookie-recipe-27.webp",
  },
  {
    id: 2,
    sku: "CRS-002",
    category: "Croissant",
    productname: "Smoke Tenderloin Slice Croissant",
    description: "Croissant gurih isi irisan daging sapi asap dan sayuran segar",
    price: 10000,
    stock: 18,
    img: "/asset/Roastbeef-croissants-portrait.jpg",
  },
  {
    id: 3,
    sku: "CRS-003",
    category: "Croissant",
    productname: "Berry Whipped Cream Croissant",
    description: "Croissant manis dengan isian krim kocok, blueberry, dan stroberi",
    price: 8000,
    stock: 15,
    img: "/asset/images.jpeg",
  },
  {
    id: 4,
    sku: "CRS-004",
    category: "Croissant",
    productname: "Sweet Granulated Sugar Croissant",
    description: "Croissant klasik dengan lapisan gula pasir karamel tipis",
    price: 5000,
    stock: 30,
    img: "/asset/chocolate-croissants-2-300x450.webp",
  },
  {
    id: 5,
    sku: "CRS-005",
    category: "Croissant",
    productname: "Sweet Chocolate Chocochips Croissant",
    description: "Croissant berlapis cokelat leleh dan taburan chocochips pekat",
    price: 22000,
    stock: 12,
    img: "/asset/IMG_0792.webp",
  },
  {
    id: 6,
    sku: "CRS-006",
    category: "Croissant",
    productname: "Basic Croissant La Ta Dhore",
    description: "Croissant mentega Perancis panggang segar untuk teman minum kopi",
    price: 8000,
    stock: 20,
    img: "/asset/Croissants-20.webp",
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(200).json(INITIAL_PRODUCTS);
      }
      const products = await prisma.product.findMany({
        orderBy: { id: "asc" },
      });
      if (!products || products.length === 0) {
        return res.status(200).json(INITIAL_PRODUCTS);
      }
      return res.status(200).json(
        products.map((p, idx) => ({
          id: p.id,
          sku: `CRS-00${p.id}`,
          category: "Croissant",
          productname: p.productname,
          description: p.description,
          price: Number(p.price),
          stock: 20,
          img: INITIAL_PRODUCTS[idx % INITIAL_PRODUCTS.length]?.img || "/asset/Croissants-20.webp",
        }))
      );
    } catch {
      return res.status(200).json(INITIAL_PRODUCTS);
    }
  } else if (req.method === "POST") {
    const { productname, description, price, sku, category, stock, img } = req.body || {};
    if (!productname || price === undefined) {
      return res.status(400).json({ error: "Nama produk dan harga wajib diisi." });
    }
    try {
      if (process.env.DATABASE_URL) {
        const created = await prisma.product.create({
          data: {
            productname: String(productname),
            description: String(description || ""),
            price: Number(price),
          },
        });
        return res.status(201).json({
          id: created.id,
          sku: sku || `SKU-${created.id}`,
          category: category || "Croissant",
          productname: created.productname,
          description: created.description,
          price: Number(created.price),
          stock: Number(stock ?? 10),
          img: img || "/asset/Croissants-20.webp",
        });
      }
    } catch {
      // Fallback to client-side hybrid state when DB is unreachable
    }
    return res.status(201).json({
      id: Date.now(),
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      category: category || "Croissant",
      productname: String(productname),
      description: String(description || ""),
      price: Number(price),
      stock: Number(stock ?? 10),
      img: img || "/asset/Croissants-20.webp",
    });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
