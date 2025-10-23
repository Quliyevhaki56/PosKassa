import ProductCard from './ProductCard';

export default function ProductGrid({ products, onAddProduct }) {
	if (products.length === 0) {
		return (
			<div className='text-center py-12 text-gray-500'>
				<p>Bu kateqoriyada məhsul yoxdur</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
			{products.map((product) => (
				<ProductCard key={product.id} product={product} onAdd={onAddProduct} />
			))}
		</div>
	);
}
