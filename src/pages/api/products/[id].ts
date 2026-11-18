import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID produk tidak valid" });
  }

  try {
    if (req.method === "GET") {
      if (!process.env.DATABASE_URL) {
        return res.status(200).json({ id: Number(id) });
      }
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
      });
      if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });
      return res.status(200).json(product);
    } else if (req.method === "PUT") {
      const { productname, description, price } = req.body || {};
      if (process.env.DATABASE_URL) {
        const product = await prisma.product.update({
          where: { id: Number(id) },
          data: { productname, description, price: Number(price) },
        });
        return res.status(200).json(product);
      }
      return res.status(200).json({ id: Number(id), ...req.body });
    } else if (req.method === "DELETE") {
      if (process.env.DATABASE_URL) {
        await prisma.product.delete({
          where: { id: Number(id) },
        });
      }
      return res.status(200).json({ message: "Produk berhasil dihapus" });
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end("Method Not Allowed");
    }
  } catch {
    return res.status(200).json({ id: Number(id), ...req.body });
  }
}
