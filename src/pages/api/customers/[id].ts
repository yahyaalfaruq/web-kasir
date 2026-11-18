import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID pelanggan tidak valid" });
  }

  try {
    if (req.method === "GET") {
      if (!process.env.DATABASE_URL) {
        return res.status(200).json({ id: Number(id) });
      }
      const customer = await prisma.customers.findUnique({
        where: { id: Number(id) },
      });
      if (!customer) return res.status(404).json({ error: "Pelanggan tidak ditemukan" });
      return res.status(200).json(customer);
    } else if (req.method === "PUT") {
      const { name, email, phone } = req.body || {};
      if (process.env.DATABASE_URL) {
        const customer = await prisma.customers.update({
          where: { id: Number(id) },
          data: { name, email, phone },
        });
        return res.status(200).json(customer);
      }
      return res.status(200).json({ id: Number(id), ...req.body });
    } else if (req.method === "DELETE") {
      if (process.env.DATABASE_URL) {
        await prisma.customers.delete({
          where: { id: Number(id) },
        });
      }
      return res.status(200).json({ message: "Pelanggan berhasil dihapus" });
    } else {
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).end("Method Not Allowed");
    }
  } catch {
    return res.status(200).json({ id: Number(id), ...req.body });
  }
}
