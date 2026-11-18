import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(200).json([]);
      }
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
    } catch {
      return res.status(200).json([]);
    }
  } else if (req.method === "POST") {
    const { productId, quantity } = req.body || {};
    try {
      if (process.env.DATABASE_URL && productId && quantity) {
        const transaction = await prisma.transaction.create({
          data: {
            productId: Number(productId),
            quantity: Number(quantity),
          },
        });
        return res.status(201).json(transaction);
      }
    } catch {
      // Fallback if DB is unavailable
    }
    return res.status(201).json({
      id: Date.now(),
      ...req.body,
      createdAt: new Date().toISOString(),
    });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
