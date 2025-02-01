
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { name, email, phone } = req.body;
      const customer = await prisma.customers.create({
        data: { name, email, phone }
      });
      return res.status(201).json(customer);
    } else if (req.method === 'GET') {
      const customers = await prisma.customers.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(customers);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error });
  }
}