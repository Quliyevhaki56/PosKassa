export default function ProductCard({ product, onAdd }) {
	return (
		<button
			onClick={() => onAdd(product)}
			className='p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-left'
		>
			{product.image && (
				<div className='mb-3 aspect-square rounded-md overflow-hidden bg-gray-100'>
					<img src={product.image} alt={product.name} className='w-full h-full object-cover' />
				</div>
			)}
			<div>
				<h3 className='font-semibold text-gray-800 text-base mb-1 line-clamp-2'>{product.name}</h3>
				{product.description && <p className='text-xs text-gray-600 mb-2 line-clamp-2'>{product.description}</p>}
				<div className='text-lg font-bold text-blue-600'>{product.price.toFixed(2)} AZN</div>
			</div>
		</button>
	);
}
