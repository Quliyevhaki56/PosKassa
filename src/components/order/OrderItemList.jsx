import OrderItem from './OrderItem';

export default function OrderItemList({ items, onUpdateQuantity, onRemove }) {
	if (!items || items.length === 0) {
		return (
			<div className='text-center py-12 text-gray-500'>
				<p>Sifariş boşdur</p>
				<p className='text-sm mt-2'>Məhsul əlavə edin</p>
			</div>
		);
	}

	// Məhsulları status əsasında ayır
	const pendingItems = items.filter(item => !item.status || item.status === 'pending');
	const sentItems = items.filter(item => item.status === 'sent_to_kitchen');
 
	return (
		<div className='space-y-4'>
			{/* Mətbəxdə olan məhsullar */}
			{sentItems.length > 0 && (
				<div>
					<h3 className='text-sm font-semibold text-gray-600 mb-2 flex items-center'>
						<span className='w-2 h-2 bg-orange-500 rounded-full mr-2'></span>
						Mətbəxdə ({sentItems.length})
					</h3>
					<div className='space-y-2'>
						{sentItems.map((item) => (
							<OrderItem 
								key={item.id} 
								item={item} 
								onUpdateQuantity={onUpdateQuantity} 
								onRemove={onRemove} 
							/>
						))}
					</div>
				</div>
			)}

			{/* Yeni əlavə edilən məhsullar */}
			{pendingItems.length > 0 && (
				<div>
					{sentItems.length > 0 && (
						<h3 className='text-sm font-semibold text-green-600 mb-2 flex items-center'>
							<span className='w-2 h-2 bg-green-500 rounded-full mr-2'></span>
							Yeni məhsullar ({pendingItems.length})
						</h3>
					)}
					<div className='space-y-2'>
						{pendingItems.map((item) => (
							<OrderItem 
								key={item.id} 
								item={item} 
								onUpdateQuantity={onUpdateQuantity} 
								onRemove={onRemove} 
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
