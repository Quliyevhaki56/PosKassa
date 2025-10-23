export default function SubCategoryTabs({ subCategories, activeSubCategory, onSelectSubCategory }) {
	if (subCategories.length === 0) {
		return null;
	}

	return (
		<div className='flex overflow-x-auto space-x-2 pb-2 scrollbar-thin'>
			{subCategories.map((subCategory) => (
				<button
					key={subCategory.id}
					onClick={() => onSelectSubCategory(subCategory.id)}
					className={`
            px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all
            ${
							activeSubCategory === subCategory.id
								? 'bg-blue-500 text-white shadow'
								: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
						}
          `}
				>
					{subCategory.name}
				</button>
			))}
		</div>
	);
}
