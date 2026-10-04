'use client';

import { CartOrderSummary } from '@/components/organisms/CartPage/CartOrderSummary';

import PaymentButton from './PaymentButton';

const Review = ({ cart }: { cart: any }) => {
  const paidByGiftcard = cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0;

  // Every seller in the cart must have a shipping method. The backend enforces
  // one method per seller, so covering each seller means one method per seller.
  const cartSellerCount = new Set(
    (cart?.items ?? [])
      .map((item: any) => item.offer?.seller_id)
      .filter(Boolean)
  ).size;
  const allSellersHaveShipping =
    cart.shipping_methods.length > 0 &&
    cart.shipping_methods.length >= cartSellerCount;

  const previousStepsCompleted =
    cart.shipping_address &&
    allSellersHaveShipping &&
    (cart.payment_collection || paidByGiftcard);

  return (
    <CartOrderSummary cart={cart}>
      {previousStepsCompleted ? (
        <div className="mt-5">
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled
            className="ui-label mt-5 h-12 w-full bg-cta text-ui text-cta-foreground opacity-50"
          >
            Place order
          </button>
          <p className="mt-3 text-small text-muted">
            Complete every step to place your order.
          </p>
        </>
      )}
    </CartOrderSummary>
  );
};

export default Review;
