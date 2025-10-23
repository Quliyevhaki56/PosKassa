export default function CategoryTabs({ categories, activeCategory, onSelectCategory }) {
	if (categories.length === 0) {
		return null;
	}

	return (
		<div className='flex overflow-x-auto space-x-2 pb-2 scrollbar-thin'>
			{categories.map((category) => (
				<button
					key={category.id}
					onClick={() => onSelectCategory(category.id)}
					className={`
            px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all
            ${activeCategory === category.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          `}
				>
					{category.name}
				</button>
			))}
		</div>
	);
}
