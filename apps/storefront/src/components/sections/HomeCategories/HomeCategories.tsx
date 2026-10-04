import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"

export const categories: {
  id: number
  name: string
  handle: string
  image: string
}[] = [
  {
    id: 1,
    name: "Home and Living",
    handle: "home-and-living",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 2,
    name: "Electronics",
    handle: "electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 3,
    name: "Fashion",
    handle: "fashion",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 4,
    name: "Beauty and Wellness",
    handle: "beauty-and-wellness",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=640&q=80",
  },
  {
    id: 5,
    name: "Sports and Outdoors",
    handle: "sports-and-outdoors",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=640&q=80",
  },
]

export const HomeCategories = async ({ heading }: { heading: string }) => {
  return (
    <section className="bg-primary py-8 w-full">
      <div className="mb-6">
        <h2 className="heading-lg text-primary uppercase">{heading}</h2>
      </div>
      <Carousel
        items={categories?.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      />
    </section>
  )
}
