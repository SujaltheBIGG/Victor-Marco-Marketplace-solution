import { Cart } from '@/components/sections';
import { retrieveCart } from '@/lib/data/cart';
import { getCartItemDetails } from '@/lib/data/cart-details';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'My cart page',
  robots: { index: false, follow: false },
};

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const details = await getCartItemDetails(await retrieveCart(), locale);

  return (
    <main className="mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6">
      <Suspense fallback={<>Loading...</>}>
        <Cart details={details} />
      </Suspense>
    </main>
  );
}
