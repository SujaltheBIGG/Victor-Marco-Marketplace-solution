import { HttpTypes } from '@medusajs/types';

import { listOffers } from './offers';
import { listProducts } from './products';

export type CartSeller = { id: string; name: string; handle: string; status?: string };

export type CartItemDetails = {
  sellersByOffer: Record<string, CartSeller>;
  conditionsByVariant: Record<string, string>;
};

// The store cart route only returns an allow-listed set of fields, so the
// offer's seller and the variant options are looked up separately.
export const getCartItemDetails = async (
  cart: HttpTypes.StoreCart | null,
  countryCode: string
): Promise<CartItemDetails> => {
  const details: CartItemDetails = { sellersByOffer: {}, conditionsByVariant: {} };
  const unique = (values: (string | null | undefined)[]) =>
    [...new Set(values.filter((value): value is string => !!value))];
  const productIds = unique((cart?.items ?? []).map((item) => item.product_id));
  const productHandles = unique((cart?.items ?? []).map((item) => item.product_handle));
  if (!productIds.length) return details;

  const [offerLists, products] = await Promise.all([
    Promise.all(
      productIds.map((productId) =>
        listOffers({ productId, countryCode })
          .then(({ offers }) => offers)
          .catch(() => [])
      )
    ),
    listProducts({
      countryCode,
      queryParams: {
        handle: productHandles,
        limit: productHandles.length,
        fields: 'id,variants.id,variants.options.value,variants.options.option.title'
      }
    }).then(({ response }) => response.products)
  ]);

  for (const offer of offerLists.flat()) {
    if (offer.seller) {
      const { id, name, handle, status } = offer.seller;
      details.sellersByOffer[offer.id] = { id, name, handle, status };
    }
  }

  for (const product of products) {
    for (const variant of product.variants ?? []) {
      const condition = variant.options?.find((o) => o.option?.title === 'Condition')?.value;
      if (condition) details.conditionsByVariant[variant.id] = condition;
    }
  }

  return details;
};
