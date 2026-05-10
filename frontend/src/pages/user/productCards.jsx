import UserLayout from '../../components/user/UserLayout';
import { ProductCard } from '../../components/user/ProductCard';

const sampleProducts = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1080&q=80',
    title: 'Embroidered Silk Gown',
    price: 299.99,
    category: 'Luxury',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1080&q=80',
    title: 'Velvet Evening Dress',
    price: 249.99,
    category: 'Pret',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1495121605193-b116b5b09ef6?auto=format&fit=crop&w=1080&q=80',
    title: 'Chiffon Party Wear',
    price: 229.99,
    category: 'Luxury',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1520975918508-5f3d7d1d6f8f?auto=format&fit=crop&w=1080&q=80',
    title: 'Premium Cotton Suit',
    price: 179.99,
    category: 'Unstitched',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1080&q=80',
    title: 'Gold Trim Saree',
    price: 189.99,
    category: 'Traditional',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1080&q=80',
    title: 'Silk Blend Kurta',
    price: 129.99,
    category: 'Pret',
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1080&q=80',
    title: 'Designer Jacket',
    price: 219.99,
    category: 'Luxury',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1530845649432-3b1c0036c6f7?auto=format&fit=crop&w=1080&q=80',
    title: 'Pleated Skirt',
    price: 99.99,
    category: 'Casual',
  },
];

export default function ProductCardsPage() {
  return (
    <UserLayout>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#592a0d]">
            Product Cards Showcase
          </h1>
          <p className="text-[#592a0d] mt-2 text-sm sm:text-base">A preview of our product card component in a responsive grid.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {sampleProducts.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              image={p.image}
              title={p.title}
              price={p.price}
              category={p.category}
              onQuickView={() => alert(`Quick view: ${p.title}`)}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-[#592a0d]">Responsive behavior: 1 column (mobile), 2 (tablet), 4 (desktop).</p>
        </div>
      </div>
    </UserLayout>
  );
}
