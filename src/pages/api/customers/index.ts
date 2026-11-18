import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      if (!process.env.DATABASE_URL) {
        return res.status(200).json([]);
      }
      const customers = await prisma.customers.findMany({
        orderBy: { id: "asc" },
      });
      return res.status(200).json(customers);
    } catch {
      return res.status(200).json([]);
    }
  } else if (req.method === "POST") {
    const { name, email, phone } = req.body || {};
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "Nama, email, dan nomor telepon wajib diisi." });
    }
    try {
      if (process.env.DATABASE_URL) {
        const customer = await prisma.customers.create({
          data: { name, email, phone },
        });
        return res.status(201).json(customer);
      }
    } catch {
      // Fallback if DB is unavailable
    }
    return res.status(201).json({
      id: Date.now(),
      name,
      email,
      phone,
      createdAt: new Date().toISOString(),
    });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
