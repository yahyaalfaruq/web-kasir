import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const { productId, quantity } = req.body;

      // Validasi input
      if (!productId || !quantity) {
        return res.status(400).json({ error: "productId and quantity are required" });
      }

      // Buat transaksi baru
      const transaction = await prisma.transaction.create({
        data: {
          productId: Number(productId),
          quantity: Number(quantity),
        },
        include: {
          product: {
            select: {
              id: true,
              productname: true,
              price: true,
            },
          },
        },
      });

      return res.status(201).json(transaction);
    } 
    
    else if (req.method === "GET") {
      // Ambil semua transaksi + produk terkait
      const transactions = await prisma.transaction.findMany({
        include: {
          product: {
            select: {
              id: true,
              productname: true,
              price: true,
            },
          },
        },
      });

      return res.status(200).json(transactions);
    } 
    
    else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Transaction API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
