import { Plus, Minus, Trash2 } from 'lucide-react';

export default function OrderItem({ item, onUpdateQuantity, onRemove }) {
	const productName = item.productName || item.name;
	const isPending = !item.status || item.status === 'pending';

	return (
		<div className={`flex items-center gap-2 p-2 rounded-lg ${
			isPending ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border border-gray-200'
		}`}>
			<div className='flex-1 min-w-0'>
				<div className='text-sm font-medium text-gray-800 truncate'>{productName}</div>
				<div className='text-xs text-gray-600'>
					{item.price.toFixed(2)} AZN
					{item.status === 'sent_to_kitchen' && (
						<span className='ml-1 text-xs bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded'>
							Mətbəxdə
						</span>
					)}
				</div>
			</div>

			<div className='flex items-center gap-1'>
				<button
					onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
					disabled={!isPending}
					className={`p-1 border rounded ${
						isPending
							? 'bg-white border-gray-300 hover:bg-gray-100'
							: 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'
					}`}
				>
					<Minus className='w-3 h-3' />
				</button>
				<span className='text-sm font-semibold w-6 text-center'>{item.quantity}</span>
				<button
					onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
					disabled={!isPending}
					className={`p-1 border rounded ${
						isPending
							? 'bg-white border-gray-300 hover:bg-gray-100'
							: 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-50'
					}`}
				>
					<Plus className='w-3 h-3' />
				</button>
			</div>

			<div className='text-sm font-bold w-16 text-right'>{item.subtotal.toFixed(2)}</div>

			<button
				onClick={() => onRemove(item.id)}
				disabled={!isPending}
				className={`p-1 rounded ${
					isPending
						? 'text-red-600 hover:bg-red-50'
						: 'text-gray-400 cursor-not-allowed'
				}`}
			>
				<Trash2 className='w-4 h-4' />
			</button>
		</div>
	);
}