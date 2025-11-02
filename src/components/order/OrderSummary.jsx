export default function OrderSummary({ order }) {
	if (!order) {
		return null;
	}

	const subtotal = order.subtotal ||
		order.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;

	const discount = order.discount || 0;
	const discountType = order.discount_type || order.discountType;
	const serviceCharge = order.service_charge || order.serviceCharge || 0;
	const tax = order.tax || 0;
	const total = order.total || order.total_amount || 0;
  console.log(order)
	return (
		<div className='bg-gray-50 rounded-lg p-3 space-y-2'>
			<div className='flex justify-between text-sm text-gray-700'>
				<span>Ara cəm:</span>
				<span className='font-semibold'>{subtotal.toFixed(2)} AZN</span>
			</div>

			{discount > 0 && (
				<div className='flex justify-between text-sm text-red-600'>
					<span>Endirim ({discountType === 'percentage' ? '%' : 'AZN'}):</span>
					<span className='font-semibold'>-{discount.toFixed(2)} AZN</span>
				</div>
			)}

			<div className='flex justify-between text-sm text-gray-700'>
				<span>Xidmət haqqı:</span>
				<span className='font-semibold'>{serviceCharge.toFixed(2)} AZN</span>
			</div>

			<div className='flex justify-between text-sm text-gray-700'>
				<span>ƏDV (18%):</span>
				<span className='font-semibold'>{tax.toFixed(2)} AZN</span>
			</div>

			<div className='border-t-2 border-gray-300 pt-2'>
				<div className='flex justify-between text-xl font-bold text-gray-900'>
					<span>ÜMUMI:</span>
					<span className='text-blue-600'>{total.toFixed(2)} AZN</span>
				</div>
			</div>
		</div>
	);
}