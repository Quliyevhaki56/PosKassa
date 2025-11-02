import { Clock, Trash2, Receipt, CreditCard, Banknote, Split, Send, User, ArrowLeftRight, Percent, MessageSquare, RotateCcw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import OrderItemList from './OrderItemList';
import OrderSummary from './OrderSummary';
import { checkPermission, PERMISSIONS } from '../../utils/permissions';

export default function OrderPanel({
	selectedTable,
	currentOrder,
	onUpdateQuantity,
	onRemove,
	onClearOrder,
	onOpenDiscount,
	onOpenPayment,
	onSendToKitchen,
	onOpenTransfer,
	onOpenComment,
	loadData,
	isProcessingPayment
}) {
	const { user } = useSelector((state) => state.auth);

	const canEditOrder = checkPermission(user, PERMISSIONS.CAN_EDIT_ORDER);
	const canDeleteOrder = checkPermission(user, PERMISSIONS.CAN_DELETE_ORDER);
	const canCheckout = checkPermission(user, PERMISSIONS.CAN_CHECKOUT);
	const canApplyDiscount = checkPermission(user, PERMISSIONS.CAN_APPLY_DISCOUNT);
	if (!selectedTable) {
		return (
			<div className='flex items-center justify-center h-full text-gray-500'>
				<p className='text-lg'>Masa seçin</p>
			</div>
		);
	}
  console.log(onOpenTransfer)
	const hasPendingItems = currentOrder?.items?.some(item => item.status === 'pending');
  console.log(currentOrder)
	const canSendToKitchen = currentOrder &&
		currentOrder?.items?.length > 0 &&
		hasPendingItems;

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
			<div className='bg-white border-b border-gray-200 p-2'>
				<div className='flex items-center justify-between mb-2'>
					<h3 className='text-base font-semibold text-gray-800'>Masa {selectedTable.table_number}</h3>
					<button
						onClick={onClearOrder}
						disabled={isProcessingPayment}
						className='px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
					>
						Təmizlə
					</button>
				</div>

				<div className='grid grid-cols-5 gap-1'>
					<button
						disabled={isProcessingPayment}
						className='flex flex-col items-center justify-center p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
					>
						<User className='w-4 h-4 mb-1' />
						<span className='text-xs'>Müştəri</span>
					</button>
					<button
						onClick={onOpenTransfer}
						disabled={isProcessingPayment || !canEditOrder}
						className='flex flex-col items-center justify-center p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
					>
						<ArrowLeftRight className='w-4 h-4 mb-1' />
						<span className='text-xs'>Transfer</span>
					</button>
					<button
						onClick={onOpenDiscount}
						disabled={isProcessingPayment || !canApplyDiscount}
						className='flex flex-col items-center justify-center p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
					>
						<Percent className='w-4 h-4 mb-1' />
						<span className='text-xs'>Endirim</span>
					</button>
					<button
						onClick={onOpenComment}
						disabled={isProcessingPayment}
						className='flex flex-col items-center justify-center p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
					>
						<MessageSquare className='w-4 h-4 mb-1' />
						<span className='text-xs'>Qeyd</span>
					</button>
					<button
						disabled={isProcessingPayment || !canDeleteOrder}
						className='flex flex-col items-center justify-center p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
					>
						<RotateCcw className='w-4 h-4 mb-1' />
						<span className='text-xs'>İadə</span>
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

			{currentOrder && currentOrder.items?.length > 0 && (
				<div className='border-t border-gray-200 p-4 space-y-3 bg-white'>
					<OrderSummary order={currentOrder} />

					{canSendToKitchen && (
						<button
							onClick={() => onSendToKitchen(currentOrder, selectedTable, loadData)}
							disabled={isProcessingPayment}
							className='w-full py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50'
						>
							Mətbəxə göndər
						</button>
					)}

					<div className='grid grid-cols-3 gap-2'>
						<button
							onClick={() => onOpenPayment('cash')}
							disabled={isProcessingPayment || !canCheckout}
							className='py-3 px-2 text-sm bg-white border-2 border-green-500 text-green-600 rounded hover:bg-green-50 font-medium disabled:opacity-50'
						>
							Nağd
						</button>
						<button
							onClick={() => onOpenPayment('card')}
							disabled={isProcessingPayment || !canCheckout}
							className='py-3 px-2 text-sm bg-white border-2 border-blue-500 text-blue-600 rounded hover:bg-blue-50 font-medium disabled:opacity-50'
						>
							Kart
						</button>
						<button
							onClick={() => onOpenPayment('mixed')}
							disabled={isProcessingPayment || !canCheckout}
							className='py-3 px-2 text-sm bg-white border-2 border-orange-500 text-orange-600 rounded hover:bg-orange-50 font-medium disabled:opacity-50'
						>
							Qarışıq
						</button>
					</div>
				</div>
			)}
		</div>
	);
}