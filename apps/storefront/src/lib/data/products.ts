'use server';

import { HttpTypes } from '@medusajs/types';

import { sortProducts } from '@/lib/helpers/sort-products';
import { SortOptions } from '@/types/product';

import { sdk } from '../client';
import { getAuthHeaders } from './cookies';
import { CACHE_TAGS, getGlobalCacheOptions } from './cache-tags';
import { getRegion, retrieveRegion } from './regions';
import { PRODUCT_LIST_FIELDS } from './product-fields';

export type SearchFacetBucket = { value: string; count: number };

/**
 * Storefront filter facets. `attributes` is keyed by the global product
 * attribute handle (e.g. `size`, `color`, `condition`); each entry is the list
 * of selectable values. Backed by `GET /store/product-attributes`.
 */
export type SearchFacets = {
  attributes: Record<string, SearchFacetBucket[]>;
};

type StoreProductAttribute = {
  handle: string;
  name: string;
  is_variant_axis: boolean;
  values?: { name: string; rank?: number }[];
};

// Facet counts are computed from this many products in the current scope.
const FACET_SAMPLE_LIMIT = 200;

export const getSearchFacets = async ({
  countryCode,
  category_id,
  collection_id,
}: {
  countryCode: string;
  category_id?: string | string[];
  collection_id?: string;
}): Promise<SearchFacets> => {
  const [{ product_attributes }, { response }] = await Promise.all([
    (
      sdk.store.productAttributes.query({
        is_filterable: true,
        limit: 100,
        fields: 'handle,name,is_variant_axis,values.name,values.rank',
        fetchOptions: { next: { revalidate: 300 } },
      } as never) as unknown as Promise<{
        product_attributes: StoreProductAttribute[];
      }>
    ).catch(() => ({ product_attributes: [] as StoreProductAttribute[] })),
    listProducts({
      countryCode,
      category_id,
      collection_id,
      queryParams: {
        limit: FACET_SAMPLE_LIMIT,
        fields: 'id,variants.options.value,variants.options.option.title',
      },
    }),
  ]);

  // handle -> option value -> number of products carrying it
  const counts = new Map<string, Map<string, number>>();
  for (const product of response.products) {
    const seen = new Set<string>();
    for (const variant of product.variants ?? []) {
      for (const option of variant.options ?? []) {
        const handle = option.option?.title?.toLowerCase();
        const key = `${handle}:${option.value}`;
        if (!handle || seen.has(key)) continue;
        seen.add(key);
        const byValue = counts.get(handle) ?? new Map<string, number>();
        byValue.set(option.value, (byValue.get(option.value) ?? 0) + 1);
        counts.set(handle, byValue);
      }
    }
  }

  const attributes: Record<string, SearchFacetBucket[]> = {};
  for (const attribute of product_attributes) {
    const byValue = counts.get(attribute.handle);
    const buckets = (attribute.values ?? [])
      .slice()
      .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      .map((value) => ({ value: value.name, count: byValue?.get(value.name) ?? 0 }))
      .filter((bucket) => bucket.count > 0);
    if (buckets.length) {
      attributes[attribute.handle] = buckets;
    }
  }

  return { attributes };
};

/**
 * Products are master products from a single shared catalog — they are
 * not owned by a seller. Seller-scoped listings and per-seller price/inventory
 * come from offers, not from a product→seller relation; use `lib/data/offers.ts`.
 */
export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  category_id,
  collection_id,
}: {
  pageParam?: number;
  queryParams?: HttpTypes.FindParams &
    HttpTypes.StoreProductParams & { handle?: string[] };
  category_id?: string | string[];
  collection_id?: string;
  countryCode?: string;
  regionId?: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
}> => {
  if (!countryCode && !regionId) {
    throw new Error('Country code or region ID is required');
  }

  const limit = queryParams?.limit || 12;
  const _pageParam = Math.max(pageParam, 1);
  const offset = (_pageParam - 1) * limit;

  const region = countryCode
    ? await getRegion(countryCode)
    : await retrieveRegion(regionId!);

  if (!region) {
    return { response: { products: [], count: 0 }, nextPage: null };
  }

  return (
    sdk.store.products.query({
      category_id,
      collection_id,
      limit,
      offset,
      region_id: region.id,
      fields: PRODUCT_LIST_FIELDS,
      ...queryParams,
      fetchOptions: {
        headers: { ...(await getAuthHeaders()) },
        cache: 'force-cache',
        next: getGlobalCacheOptions(CACHE_TAGS.products),
      },
    } as never) as unknown as Promise<{ products: HttpTypes.StoreProduct[]; count: number }>
  )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null;

      return {
        response: { products, count },
        nextPage,
        queryParams,
      };
    })
    .catch(() => ({
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    }));
};

export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = 'created_at',
  countryCode,
  category_id,
  collection_id,
}: {
  page?: number;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
  sortBy?: SortOptions;
  countryCode: string;
  category_id?: string | string[];
  collection_id?: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
}> => {
  const limit = queryParams?.limit || 12;

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: { ...queryParams, limit: 100 },
    category_id,
    collection_id,
    countryCode,
  });

  const pricedProducts = products.filter(prod =>
    prod.variants?.some(variant => variant.calculated_price !== null)
  );

  const sortedProducts = sortProducts(pricedProducts, sortBy);

  const pageParam = (page - 1) * limit;
  const nextPage = count > pageParam + limit ? pageParam + limit : null;
  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit);

  return {
    response: { products: paginatedProducts, count },
    nextPage,
    queryParams,
  };
};

export const getProductByHandle = async (handle: string, regionId: string) => {
  const next = getGlobalCacheOptions(
    CACHE_TAGS.products,
    CACHE_TAGS.product(handle)
  );

  return (
    sdk.store.products.query({
      handle,
      region_id: regionId,
      fields: PRODUCT_LIST_FIELDS,
      fetchOptions: {
        headers: { ...(await getAuthHeaders()) },
        cache: 'force-cache',
        next,
      },
    } as never) as unknown as Promise<{ products: HttpTypes.StoreProduct[] }>
  ).then(({ products }) => products[0]);
};

/**
 * Price sorts are applied client-side because `/store/products` can only order
 * by product columns.
 */
export const searchProducts = async ({
  query,
  countryCode,
  regionId,
  category_id,
  collection_id,
  seller_id,
  attributes,
  page = 1,
  limit = 12,
  sortBy,
}: {
  query?: string;
  countryCode?: string;
  regionId?: string;
  category_id?: string | string[];
  collection_id?: string | string[];
  seller_id?: string | string[];
  attributes?: Record<string, string | string[]>;
  page?: number;
  limit?: number;
  sortBy?: SortOptions;
}): Promise<{
  products: HttpTypes.StoreProduct[];
  count: number;
  nextPage: number | null;
}> => {
  const region = countryCode ? await getRegion(countryCode) : { id: regionId };

  if (!region?.id) {
    return { products: [], count: 0, nextPage: null };
  }

  const offset = Math.max(page - 1, 0) * limit;
  const order = !sortBy || sortBy === 'created_at' ? '-created_at' : undefined;

  const hasAttributeFilters =
    attributes && Object.keys(attributes).length > 0;

  const { products, count } = await (sdk.store.products.query({
    q: query || undefined,
    region_id: region.id,
    category_id,
    collection_id,
    seller_id,
    attributes: hasAttributeFilters ? attributes : undefined,
    order,
    limit,
    offset,
    fields: PRODUCT_LIST_FIELDS,
    fetchOptions: { headers: { ...(await getAuthHeaders()) }, cache: 'no-cache' },
  } as never) as unknown as Promise<{
    products: HttpTypes.StoreProduct[];
    count: number;
  }>).catch(() => ({
    products: [] as HttpTypes.StoreProduct[],
    count: 0,
  }));

  const ordered =
    sortBy === 'price_asc' || sortBy === 'price_desc'
      ? sortProducts(products, sortBy)
      : products;

  const nextPage = count > offset + limit ? page + 1 : null;

  return { products: ordered, count, nextPage };
};
