import { Suspense } from 'react';

import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PaymentWrapper from '@/components/organisms/PaymentContainer/PaymentWrapper';
import { CartAddressSection } from '@/components/sections/CartAddressSection/CartAddressSection';
import CartPaymentSection from '@/components/sections/CartPaymentSection/CartPaymentSection';
import CartReview from '@/components/sections/CartReview/CartReview';
import CartShippingMethodsSection from '@/components/sections/CartShippingMethodsSection/CartShippingMethodsSection';
import { retrieveCart } from '@/lib/data/cart';
import { retrieveCustomer } from '@/lib/data/customer';
import { listCartShippingMethods } from '@/lib/data/fulfillment';
import { listCartPaymentMethods } from '@/lib/data/payment';
import { CheckoutSteps } from '@/components/molecules/CheckoutSteps/CheckoutSteps';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'My cart page - Checkout',
  robots: { index: false, follow: false }
};

export default async function CheckoutPage({}) {
  return (
    <Suspense
      fallback={<div className="container flex items-center justify-center" data-testid="checkout-page-loading">Loading...</div>}
    >
      <CheckoutPageContent />
    </Suspense>
  );
}

async function CheckoutPageContent({}) {
  const cart = await retrieveCart();

  if (!cart) {
    return notFound();
  }

  const shippingMethods = await listCartShippingMethods(cart.id, false);
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? '');
  const customer = await retrieveCustomer();

  return (
    <PaymentWrapper cart={cart}>
      <main className="mx-auto w-full max-w-screen-xl px-4 py-8 sm:px-6" data-testid="checkout-page">
        <h1 className="font-display text-h1 font-normal text-heading lg:text-[2.5rem]">Checkout</h1>
        <CheckoutSteps
          completed={{
            address: !!cart.shipping_address?.address_1,
            delivery: (cart.shipping_methods?.length ?? 0) > 0,
            payment: !!cart.payment_collection?.payment_sessions?.length,
          }}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div className="flex flex-col gap-4" data-testid="checkout-steps-container">
            <CartAddressSection
              cart={cart}
              customer={customer}
            />
            <CartShippingMethodsSection
              cart={cart}
              availableShippingMethods={shippingMethods as any}
            />
            <CartPaymentSection
              cart={cart}
              availablePaymentMethods={paymentMethods}
            />
          </div>

          <div className="lg:sticky lg:top-6" data-testid="checkout-review-container">
            <CartReview cart={cart} />
          </div>
        </div>
      </main>
    </PaymentWrapper>
  );
}
