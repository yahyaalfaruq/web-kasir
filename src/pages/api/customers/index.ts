import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Pastikan req.body terdefinisi
      if (!req.body) {
        return res.status(400).json({ error: 'Request body is missing' });
      }

      const { name, email, phone } = req.body;

      // Validasi data
      if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone are required' });
      }

      // Buat customer baru
      const customer = await prisma.customers.create({
        data: { name, email, phone },
      });
      return res.status(201).json(customer);
    } else if (req.method === 'GET') {
      const customers = await prisma.customers.findMany({
        orderBy: { id: 'asc' },
      });
      return res.status(200).json(customers);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}