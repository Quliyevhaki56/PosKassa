import { forwardRef } from 'react';
import { format } from 'date-fns';

const Receipt = forwardRef(({ order, restaurant, tableNumber }, ref) => {
 
	return (
		<div ref={ref} className='p-8 bg-white max-w-sm mx-auto text-black'>
			<style>
				{`
          @media print {
            body { margin: 0; padding: 0; }
            @page { margin: 0; }
          }
        `}
			</style>

			<div className='text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4'>
				{restaurant?.logo_url && <img src={restaurant.logo_url} alt={restaurant.name} className='w-20 h-20 mx-auto mb-3 object-contain' />}
				<h1 className='text-xl font-bold mb-1'>{restaurant?.name || 'Restoran'}</h1>
				{restaurant?.address && <p className='text-xs text-gray-600'>{restaurant.address}</p>}
				{restaurant?.phone && <p className='text-xs text-gray-600'>{restaurant.phone}</p>}
			</div>

			<div className='text-sm mb-4 space-y-1'>
				<div className='flex justify-between'>
					<span>Tarix:</span>
					<span className='font-semibold'>{format(new Date(order.completedAt || order.startedAt), 'dd.MM.yyyy')}</span>
				</div>
				<div className='flex justify-between'>
					<span>Saat:</span>
					<span className='font-semibold'>{format(new Date(order.completedAt || order.startedAt), 'HH:mm')}</span>
				</div>
				<div className='flex justify-between'>
					<span>Masa:</span>
					<span className='font-semibold'>{tableNumber}</span>
				</div>
			</div>

			<div className='border-y-2 border-gray-400 py-2 mb-2'>
				<div className='text-center text-sm font-semibold'>ƏDV: {restaurant?.tax_rate || 18}%</div>
			</div>

			<div className='mb-4'>
				{order.items.map((item, index) => (
					<div key={index} className='flex justify-between text-sm mb-2'>
						<div className='flex-1'>
							<div className='font-medium'>
								{item.quantity}x {item.productName}
							</div>
							<div className='text-xs text-gray-600'>{item.price.toFixed(2)} AZN</div>
						</div>
						<div className='font-semibold whitespace-nowrap ml-4'>{item.subtotal.toFixed(2)} AZN</div>
					</div>
				))}
			</div>

			<div className='border-t-2 border-dashed border-gray-400 pt-2 mb-2 space-y-2 text-sm'>
				<div className='flex justify-between'>
					<span>Ara cəm:</span>
					<span className='font-semibold'>{order.total_amount.toFixed(2)} AZN</span>
				</div>

				{order.discount > 0 && (
					<div className='flex justify-between text-red-600'>
						<span>Endirim:</span>
						<span className='font-semibold'>-{order.discount.toFixed(2)} AZN</span>
					</div>
				)}

				<div className='flex justify-between'>
					<span>ƏDV ({restaurant?.tax_rate || 18}%):</span>
					<span className='font-semibold'>{order.tax.toFixed(2)} AZN</span>
				</div>
			</div>

			<div className='border-y-4 border-double border-gray-800 py-3 mb-4'>
				<div className='flex justify-between text-xl font-bold'>
					<span>ÜMUMI:</span>
					<span>{order.total_amount.toFixed(2)} AZN</span>
				</div>
			</div>

			<div className='text-center text-sm mb-4 pb-4 border-b-2 border-dashed border-gray-400'>
				<div className='font-semibold mb-1'>
					Ödəniş: {order.paymentMethod === 'cash' ? 'Nağd' : order.paymentMethod === 'card' ? 'Kart' : 'Qarışıq'}
				</div>

				{order.paymentMethod === 'cash' && order.paymentDetails?.change !== undefined && (
					<div className='text-xs text-gray-600'>
						Verilən: {order.paymentDetails.cashGiven?.toFixed(2)} AZN
						<br />
						Qalıq: {order.paymentDetails.change?.toFixed(2)} AZN
					</div>
				)}

				{order.paymentMethod === 'mixed' && order.paymentDetails && (
					<div className='text-xs text-gray-600'>
						Nağd: {order.paymentDetails.cashAmount?.toFixed(2)} AZN
						<br />
						Kart: {order.paymentDetails.cardAmount?.toFixed(2)} AZN
					</div>
				)}
			</div>

			<div className='text-center text-sm'>
				<p className='font-semibold'>Təşəkkür edirik!</p>
			</div>

			<div className='border-t-2 border-dashed border-gray-400 mt-4 pt-2 text-center text-xs text-gray-500'>
				<p>Sifariş ID: {order.id}</p>
			</div>
		</div>
	);
});

Receipt.displayName = 'Receipt';

export default Receipt;
