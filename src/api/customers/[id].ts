
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid customer ID' });
  }

  try {
    if (req.method === 'GET') {
      const customer = await prisma.customers.findUnique({
        where: { id: Number(id) },
      });
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      return res.status(200).json(customer);
    } else if (req.method === 'PUT') {
      const { name, email, phone} = req.body;
      const customer = await prisma.customers.update({
        where: { id: Number(id) },
        data: { name, email, phone, },
      });
      return res.status(200).json(customer);
    } else if (req.method === 'DELETE') {
      await prisma.customers.delete({
        where: { id: Number(id) },
      });
      return res.status(200).json({ message: 'Customer deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end('Method Not Allowed');
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', details: error });
  }
}