'use server';

import { getProductPrice } from '@/lib/helpers/get-product-price';

import { listCategories } from './categories';
import { searchProducts } from './products';

export type SearchSuggestions = {
  products: { handle: string; title: string; thumbnail: string | null; price: string | null }[];
  categories: { name: string; handle: string }[];
};

export const getSearchSuggestions = async (
  query: string,
  countryCode: string
): Promise<SearchSuggestions> => {
  const term = query.trim();
  if (term.length < 2) {
    return { products: [], categories: [] };
  }

  const [{ products }, categories] = await Promise.all([
    searchProducts({ query: term, countryCode, limit: 6 }),
    listCategories()
      .then(({ categories }) => categories)
      .catch(() => []),
  ]);
  const lower = term.toLowerCase();

  return {
    products: products.map((product) => ({
      handle: product.handle ?? '',
      title: product.title ?? '',
      thumbnail: product.thumbnail ?? null,
      price: getProductPrice({ product }).cheapestPrice?.calculated_price ?? null,
    })),
    categories: categories
      .filter((category) => category.name.toLowerCase().includes(lower))
      .slice(0, 4)
      .map((category) => ({ name: category.name, handle: category.handle })),
  };
};
