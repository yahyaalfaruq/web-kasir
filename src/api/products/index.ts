
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { productname, description, price, total } = req.body;
      const product = await prisma.product.create({
        data: { productname, description, price, total },
      });
      return res.status(201).json(product);
    } else if (req.method === 'GET') {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(products);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error });
  }
}