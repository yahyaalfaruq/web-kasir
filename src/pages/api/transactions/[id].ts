import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id, productId } = req.query;
  console.log("Query params:", { id, productId });

  // Validasi ID dan Product ID
  if (isNaN(Number(id)) || isNaN(Number(productId))) {
    return res.status(400).json({ error: "Invalid ID or Product ID" });
  }

  try {
    if (req.method === "GET") {
      // Ambil data transaksi dan produk terkait
      const transaction = await prisma.transaction.findUnique({
        where: { id: Number(id), productId: Number(productId) },
        include: {
          product: {
            select: {
              id: true,
              productname: true, // Title dari produk
              price: true,
            },
          },
        },
      });

      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      // Struktur data yang akan dikirim
      return res.status(200).json({
        id: transaction.product.id,
        title: transaction.product.productname,
        price: transaction.product.price,
        quantity: transaction.productId
      });
    } else if (req.method === "PUT") {
      const transaction = await prisma.transaction.update({
        where: { id: Number(id), productId: Number(productId) },
        data: req.body,
      });
      return res.status(200).json(transaction);
    } else if (req.method === "DELETE") {
      await prisma.transaction.delete({
        where: { id: Number(id), productId: Number(productId) },
      });
      return res
        .status(200)
        .json({ message: "Transaction deleted successfully" });
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end("Method Not Allowed");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
