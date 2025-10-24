import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MenuGrid({
	categories,
	products,
	activeCategory,
	onSelectCategory,
	onAddProduct
}) {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 16;

	const displayItems = useMemo(() => {
		if (!activeCategory) {
			const mainCategories = categories.filter(c => !c.parent_id);
			return mainCategories.map(cat => ({ type: 'category', data: cat }));
		}

		const subCategories = categories.filter(c => c.parent_id === activeCategory);
		const categoryProducts = products.filter(p => {
			if (subCategories.length > 0) {
				const allCatIds = [activeCategory, ...subCategories.map(sc => sc.id)];
				return allCatIds.includes(p.category_id);
			}
			return p.category_id === activeCategory;
		});

		const items = [];

		if (subCategories.length > 0) {
			subCategories.forEach(sc => {
				items.push({ type: 'subcategory', data: sc });
			});
		}

		categoryProducts.forEach(p => {
			items.push({ type: 'product', data: p });
		});

		return items;
	}, [categories, products, activeCategory]);

	const totalPages = Math.ceil(displayItems.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentItems = displayItems.slice(startIndex, endIndex);

	const handleItemClick = (item) => {
		if (item.type === 'category' || item.type === 'subcategory') {
			onSelectCategory(item.data.id);
			setCurrentPage(1);
		} else if (item.type === 'product') {
			onAddProduct(item.data);
		}
	};

	const getCategoryColor = (index) => {
		const colors = [
			'bg-blue-400',
			'bg-purple-400',
			'bg-orange-400',
			'bg-green-400',
			'bg-pink-400',
			'bg-yellow-400',
		];
		return colors[index % colors.length];
	};

	return (
		<div className='flex flex-col h-full'>
			<div className='flex-1 p-4'>
				<div className='grid grid-cols-4 gap-4 h-full'>
					{currentItems.map((item, index) => {
						const isCategory = item.type === 'category' || item.type === 'subcategory';

						return (
							<button
								key={`${item.type}-${item.data.id}`}
								onClick={() => handleItemClick(item)}
								className={`
									relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow
									flex flex-col items-center ${item.data.image ? null : "justify-center"} text-center
									${isCategory ? getCategoryColor(index) + ' text-white' : 'bg-white border border-gray-200 hover:border-gray-300'}
								`}
								style={{ aspectRatio: '1/1' }}
							>
								{item.data.image && !isCategory && (
									<img
										src={item.data.image}
										alt={item.data.name}
										className='w-full md:min-h-42 object-cover rounded'
									/>
								)}

								<div className={`font-semibold md:text-2xl ${isCategory ? 'text-white text-xs xl:text-xl' : 'text-gray-800'}`}>
									{item.data.name}
								</div>

								{item.type === 'product' && (
									<div className='text-xs md:text-sm font-bold text-gray-600 mt-1'>
										{item.data.price.toFixed(2)} AZN
									</div>
								)}
							</button>
						);
					})}
				</div>
			</div>

			{totalPages > 1 && (
				<div className='flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white'>
					<button
						onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
						disabled={currentPage === 1}
						className='p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed'
					>
						<ChevronLeft className='w-6 h-6' />
					</button>

					<span className='text-sm text-gray-600'>
						Page {currentPage} / {totalPages}
					</span>

					<button
						onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
						disabled={currentPage === totalPages}
						className='p-2 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed'
					>
						<ChevronRight className='w-6 h-6' />
					</button>
				</div>
			)}
		</div>
	);
}
