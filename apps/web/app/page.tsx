import Image from 'next/image';

// بيانات المنتجات (يمكنك تعديلها)
const products = [
  {
    id: 1,
    name: 'Chocolate Cake',
    price: 45,
    image: '/products/cake1.jpg',
    description: 'Rich chocolate cake with layers'
  },
  {
    id: 2,
    name: 'Strawberry Delight',
    price: 50,
    image: '/products/cake2.jpg',
    description: 'Fresh strawberries with cream'
  },
  {
    id: 3,
    name: 'Red Velvet',
    price: 55,
    image: '/products/cake3.jpg',
    description: 'Classic red velvet cake'
  },
  {
    id: 4,
    name: 'Cheesecake',
    price: 48,
    image: '/products/cake4.jpg',
    description: 'Creamy New York cheesecake'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header / Logo */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            {/* Logo */}
            <div className="relative w-32 h-32">
              <Image
                src="/logo.png"
                alt="SugerMoon Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-center text-pink-600 mt-4">
            🧁 SugerMoon
          </h1>
          <p className="text-center text-gray-600 mt-2">
            Luxury Desserts E-Commerce
          </p>
        </div>
      </header>

      {/* Products Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Our Products
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Product Image */}
              <div className="relative w-full h-64">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-pink-600">
                    ${product.price}
                  </span>
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-600 text-white text-center py-6 mt-12">
        <p>© 2026 SugerMoon. All rights reserved.</p>
      </footer>
    </main>
  );
}
