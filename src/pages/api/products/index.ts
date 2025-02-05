import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Pastikan req.body terdefinisi
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }

      const { productname, description, price } = req.body;

      // Validasi data
      if (!productname || !description || !price) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Buat produk baru
      const product = await prisma.product.create({
        data: { productname, description, price },
      });
      return res.status(201).json(product);
    } else if (req.method === 'GET') {
      const products = await prisma.product.findMany({
        orderBy: { id: 'asc' },
      });
      return res.status(200).json(products);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error'});
  }
}