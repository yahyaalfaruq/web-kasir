
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    if (req.method === 'GET') {
      const product = await prisma.product.findUnique({
        where: { id: Number(id) },
      });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      return res.status(200).json(product);
    } else if (req.method === 'PUT') {
      const { productname, description, price, total } = req.body;
      const product = await prisma.product.update({
        where: { id: Number(id) },
        data: { productname, description, price },
      });
      return res.status(200).json(product);
    } else if (req.method === 'DELETE') {
      await prisma.product.delete({
        where: { id: Number(id) },
      });
      return res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error });
  }
}