import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/index.html'); // Redirect to the HTML file in the public directory
  }, [router]);

  return null; // Render nothing while redirecting
}