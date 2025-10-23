import { useState } from 'react';
import { X, Percent, DollarSign } from 'lucide-react';

export default function DiscountModal({ isOpen, onClose, onApply, currentSubtotal }) {
	const [discountType, setDiscountType] = useState('percentage');
	const [customValue, setCustomValue] = useState('');

	if (!isOpen) return null;

	const handleApply = (value) => {
		if (value <= 0) return;

		if (discountType === 'amount' && value > currentSubtotal) {
			alert('Endirim məbləği ara cəmdən böyük ola bilməz');
			return;
		}

		if (discountType === 'percentage' && value > 100) {
			alert('Endirim faizi 100-dən böyük ola bilməz');
			return;
		}

		onApply(discountType, value);
		onClose();
		setCustomValue('');
	};

	const percentageOptions = [10, 20, 50];
	const amountOptions = [5, 10, 20];

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<h2 className='text-2xl font-bold text-gray-800'>Endirim tətbiq et</h2>
					<button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
						<X className='w-6 h-6' />
					</button>
				</div>

				<div className='p-6 space-y-6'>
					<div className='flex gap-4'>
						<button
							onClick={() => setDiscountType('percentage')}
							className={`flex-1 p-4 rounded-lg border-2 transition-all ${
								discountType === 'percentage' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
							}`}
						>
							<Percent className='w-6 h-6 mx-auto mb-2 text-blue-600' />
							<div className='font-semibold'>Faizlə</div>
						</button>

						<button
							onClick={() => setDiscountType('amount')}
							className={`flex-1 p-4 rounded-lg border-2 transition-all ${
								discountType === 'amount' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
							}`}
						>
							<DollarSign className='w-6 h-6 mx-auto mb-2 text-blue-600' />
							<div className='font-semibold'>Məbləğlə</div>
						</button>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-3'>Sürətli seçim</label>
						<div className='grid grid-cols-3 gap-3'>
							{(discountType === 'percentage' ? percentageOptions : amountOptions).map((value) => (
								<button
									key={value}
									onClick={() => handleApply(value)}
									className='py-3 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold transition-colors'
								>
									{value}
									{discountType === 'percentage' ? '%' : ' AZN'}
								</button>
							))}
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Xüsusi məbləğ</label>
						<div className='flex gap-2'>
							<input
								type='number'
								value={customValue}
								onChange={(e) => setCustomValue(e.target.value)}
								placeholder={discountType === 'percentage' ? '0-100' : '0.00'}
								className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
								min='0'
								max={discountType === 'percentage' ? '100' : currentSubtotal}
								step={discountType === 'percentage' ? '1' : '0.01'}
							/>
							<button
								onClick={() => handleApply(parseFloat(customValue))}
								disabled={!customValue || parseFloat(customValue) <= 0}
								className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
							>
								Tətbiq et
							</button>
						</div>
					</div>

					<div className='bg-gray-50 rounded-lg p-4'>
						<div className='text-sm text-gray-600 mb-1'>Cari ara cəm</div>
						<div className='text-2xl font-bold text-gray-800'>{currentSubtotal.toFixed(2)} AZN</div>
					</div>
				</div>
			</div>
		</div>
	);
}
