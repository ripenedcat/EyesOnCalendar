'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    router.push(`/${year}/${month}`);
  }, [router]);

  return <div className="p-8">Redirecting to current month...</div>;
}
