import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/index.html'); // Redirect to the HTML file in the public directory
  }, [router]);

    // Definisi tipe data
    type Customer = {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  
    type Transaction = {
      id: string;
      productId: number;
      productname: string;
      price: number;
      quantity: number;
    };
  
    type Product = {
      id: string;
      productname: string;
      description: string;
      price: number;
    };
  
    // State untuk customers & transactions
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
  
    // Fetch data customers
    useEffect(() => {
      fetch("/api/customers")
        .then((res) => res.json())
        .then((data) => setCustomers(data));
    }, []);
  
    // Fetch data transactions
    useEffect(() => {
      fetch("/api/transactions")
        .then((res) => res.json())
        .then((data) => setTransactions(data));
    }, []);
  
    // Fetch data products
    useEffect(() => {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => setProducts(data));
    }, []);
  
    return (
      <div>
        <h1>Customers</h1>
        <ul>
          {customers.map((customer) => (
            <li key={customer.id}>
              {customer.name} - {customer.email} {customer.phone}
            </li>
          ))}
        </ul>
  
        <h1>Transactions</h1>
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.productId} - {transaction.productname} {transaction.price} {transaction.quantity}
            </li>
          ))}
        </ul>

        <h1>Products</h1>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
             {product.productname} {product.description} {product.price}
            </li>
          ))}
        </ul>
      </div>
  
    );

  return null; // Render nothing while redirecting
}