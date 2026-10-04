'use server';

export type ProductReview = {
  id: string;
  rating: number;
  text: string | null;
  response: string | null;
  author: string;
  created_at: string;
};

export type ProductReviewList = { reviews: ProductReview[]; count: number; average: number };

export const getProductReviews = async (productId: string): Promise<ProductReviewList> => {
  const response = await fetch(
    `${process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'}/store/products/${productId}/reviews`,
    {
      headers: { 'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string },
      next: { revalidate: 600 },
    }
  ).catch(() => null);

  if (!response?.ok) {
    return { reviews: [], count: 0, average: 0 };
  }
  return (await response.json()) as ProductReviewList;
};
