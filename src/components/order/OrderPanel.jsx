import { Clock, Trash2, Receipt, CreditCard, Banknote, Split, Send } from 'lucide-react';
import { format } from 'date-fns';
import OrderItemList from './OrderItemList';
import OrderSummary from './OrderSummary';

export default function OrderPanel({ 
	selectedTable, 
	currentOrder, 
	onUpdateQuantity, 
	onRemove, 
	onClearOrder, 
	onOpenDiscount, 
	onOpenPayment, 
	onSendToKitchen, 
	loadData,
	isProcessingPayment // YENİ prop
}) {
	if (!selectedTable) {
		return (
			<div className='flex items-center justify-center h-full text-gray-500'>
				<p className='text-lg'>Masa seçin</p>
			</div>
		);
	}

	// Pending məhsullar var mı? (Mətbəxə göndərilməmiş)
	const hasPendingItems = currentOrder?.items?.some(item => item.status === 'pending');
	
	// Mətbəxə göndərmə şərti
	const canSendToKitchen = currentOrder && 
		currentOrder?.items?.length > 0 && 
		hasPendingItems;

	// Tarix formatı - null/undefined check
	const getFormattedTime = () => {
		if (!currentOrder) return '--:--';
		
		const timeValue = currentOrder.started_at || currentOrder.startedAt;
		if (!timeValue) return '--:--';
		
		try {
			return format(new Date(timeValue), 'HH:mm');
		} catch (error) {
			console.error('Invalid date format:', error);
			return '--:--';
		}
	};

	return (
		<div className='flex flex-col h-full'>
			{/* Header */}
			<div className='bg-white border-b border-gray-200 p-3'>
				<div className='flex items-center justify-between mb-1'>
					<h3 className='text-lg font-semibold text-gray-800'>Masa {selectedTable.table_number}</h3>
					<button
						onClick={onClearOrder}
						disabled={isProcessingPayment}
						className='px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
					>
						Təmizlə
					</button>
				</div>
			</div>

			{/* Order Items */}
			<div className='flex-1 overflow-y-auto p-4'>
				<OrderItemList 
					items={currentOrder?.items || []} 
					onUpdateQuantity={onUpdateQuantity} 
					onRemove={onRemove} 
				/>
			</div>

			{/* Actions */}
			{currentOrder && currentOrder.items?.length > 0 && (
				<div className='border-t border-gray-200 p-4 space-y-4 bg-white'>
					<OrderSummary order={currentOrder} />
					
					<div className='grid grid-cols-4 gap-2'>
						<button
							onClick={onOpenDiscount}
							disabled={isProcessingPayment}
							className='px-2 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
						>
							Endirim
						</button>

						{canSendToKitchen && (
							<button
								onClick={() => onSendToKitchen(currentOrder, selectedTable, loadData)}
								disabled={isProcessingPayment}
								className='px-2 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
							>
								Mətbəx
							</button>
						)}
					</div>

					<div className='grid grid-cols-3 gap-2'>
						<button
							onClick={() => onOpenPayment('cash')}
							disabled={isProcessingPayment}
							className='py-3 px-2 text-sm bg-white border-2 border-green-500 text-green-600 rounded hover:bg-green-50 font-medium disabled:opacity-50'
						>
							Nağd
						</button>
						<button
							onClick={() => onOpenPayment('card')}
							disabled={isProcessingPayment}
							className='py-3 px-2 text-sm bg-white border-2 border-blue-500 text-blue-600 rounded hover:bg-blue-50 font-medium disabled:opacity-50'
						>
							Kart
						</button>
						<button
							onClick={() => onOpenPayment('mixed')}
							disabled={isProcessingPayment}
							className='py-3 px-2 text-sm bg-white border-2 border-purple-500 text-purple-600 rounded hover:bg-purple-50 font-medium disabled:opacity-50'
						>
							Qarışıq
						</button>
					</div>
				</div>
			)}
		</div>
	);
}