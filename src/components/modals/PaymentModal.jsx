import { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, Split, Check } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onComplete, onUnpaidClose, order, paymentType }) {
	const [cashAmount, setCashAmount] = useState('');
	const [cardAmount, setCardAmount] = useState('');
	const [change, setChange] = useState(0);
	const [confirmed, setConfirmed] = useState(false);
	const [error, setError] = useState('');
	const [showUnpaidReason, setShowUnpaidReason] = useState(false);
	const [unpaidReason, setUnpaidReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
	useEffect(() => {
		if (isOpen) {
			setCashAmount('');
			setCardAmount('');
			setChange(0);
			setConfirmed(false);
			setError('');
			setShowUnpaidReason(false);
			setUnpaidReason('');
			setIsSubmitting(false);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!order) return;

		const total = parseFloat(order.total) || 0;

		if (paymentType === 'cash' && cashAmount) {
			const cash = parseFloat(cashAmount) || 0;
			const calculatedChange = cash - total;
			setChange(calculatedChange);
			setError(calculatedChange < 0 ? 'Verilən məbləğ kifayət deyil' : '');
		}

		if (paymentType === 'mixed' && (cashAmount || cardAmount)) {
			const cash = parseFloat(cashAmount) || 0;
			const card = parseFloat(cardAmount) || 0;
			const diff = cash + card - total;
			setError(Math.abs(diff) > 0.01 ? `Fərq: ${diff.toFixed(2)} AZN` : '');
		}
	}, [cashAmount, cardAmount, order, paymentType]);

	if (!isOpen) return null;

const handleComplete = async () => {
	if (isSubmitting) {
		console.log('Artıq göndərilir, gözləyin...');
		return;
	}

	if (!order) {
		setError('Sifariş məlumatı mövcud deyil');
		return;
	}

	const total = parseFloat(order.total_amount || order.total) || 0;

	if (paymentType === 'cash') {
		const cash = parseFloat(cashAmount) || 0;
		if (cash < total) {
			setError('Verilən məbləğ kifayət deyil');
			return;
		}
	}

	if (paymentType === 'card' && !confirmed) {
		setError('Ödənişi təsdiqləyin');
		return;
	}

	if (paymentType === 'mixed') {
		const cash = parseFloat(cashAmount) || 0;
		const card = parseFloat(cardAmount) || 0;
		if (Math.abs(cash + card - total) > 0.01) {
			setError('Məbləğlər cəmi ümumi məbləğə bərabər olmalıdır');
			return;
		}
	}

	setIsSubmitting(true);

	try {
		const paymentDetails = {
			paymentMethod: paymentType,
			...(paymentType === 'cash' && { cashGiven: parseFloat(cashAmount) || 0, change }),
			...(paymentType === 'mixed' && { cashAmount: parseFloat(cashAmount) || 0, cardAmount: parseFloat(cardAmount) || 0 }),
		};

		await onComplete(paymentDetails);
	} catch (error) {
		console.error('Payment error:', error);
		setError('Ödəniş zamanı xəta baş verdi');
		setIsSubmitting(false);
	}
};

	const getIcon = () => {
		switch (paymentType) {
			case 'cash':
				return <Banknote className='w-8 h-8' />;
			case 'card':
				return <CreditCard className='w-8 h-8' />;
			case 'mixed':
				return <Split className='w-8 h-8' />;
			default:
				return null;
		}
	};

	const getTitle = () => {
		switch (paymentType) {
			case 'cash':
				return 'Nağd Ödəniş';
			case 'card':
				return 'Kart Ödənişi';
			case 'mixed':
				return 'Qarışıq Ödəniş';
			default:
				return 'Ödəniş';
		}
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-md w-full'>
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<div className='flex items-center space-x-3'>
						<div className='text-blue-600'>{getIcon()}</div>
						<h2 className='text-2xl font-bold text-gray-800'>{getTitle()}</h2>
					</div>
					<button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
						<X className='w-6 h-6' />
					</button>
				</div>

				<div className='p-6 space-y-6'>
					<div className='bg-blue-50 rounded-lg p-4 border border-blue-200'>
						<div className='text-sm text-gray-600 mb-1'>Ödəniləcək məbləğ</div>
						<div className='text-3xl font-bold text-blue-600'>{(parseFloat(order?.total_amount || order?.total) || 0).toFixed(2)} AZN</div>
					</div>

					{paymentType === 'cash' && (
						<>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Verilən məbləğ</label>
								<input
									type='number'
									value={cashAmount}
									onChange={(e) => setCashAmount(e.target.value)}
									placeholder='0.00'
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
									min='0'
									step='0.01'
									autoFocus
								/>
							</div>

							{cashAmount && change >= 0 && (
								<div className='bg-green-50 rounded-lg p-4 border border-green-200'>
									<div className='text-sm text-gray-600 mb-1'>Qalıq</div>
									<div className='text-2xl font-bold text-green-600'>{change.toFixed(2)} AZN</div>
								</div>
							)}
						</>
					)}

					{paymentType === 'card' && (
						<div className='space-y-4'>
							<div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
								<p className='text-center text-gray-600'>Kart terminalında ödənişi tamamlayın</p>
							</div>
							<label className='flex items-center justify-center space-x-3 cursor-pointer'>
								<input
									type='checkbox'
									checked={confirmed}
									onChange={(e) => setConfirmed(e.target.checked)}
									className='w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
								/>
								<span className='text-lg font-medium'>Ödəniş uğurludur</span>
								{confirmed && <Check className='w-6 h-6 text-green-600' />}
							</label>
						</div>
					)}

					{paymentType === 'mixed' && (
						<>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Nağd məbləğ</label>
								<input
									type='number'
									value={cashAmount}
									onChange={(e) => setCashAmount(e.target.value)}
									placeholder='0.00'
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
									min='0'
									step='0.01'
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Kart məbləğ</label>
								<input
									type='number'
									value={cardAmount}
									onChange={(e) => setCardAmount(e.target.value)}
									placeholder='0.00'
									className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
									min='0'
									step='0.01'
								/>
							</div>

							{(cashAmount || cardAmount) && (
								<div className='bg-gray-50 rounded-lg p-3'>
									<div className='flex justify-between text-sm mb-1'>
										<span>Nağd:</span>
										<span className='font-semibold'>{parseFloat(cashAmount || 0).toFixed(2)} AZN</span>
									</div>
									<div className='flex justify-between text-sm mb-1'>
										<span>Kart:</span>
										<span className='font-semibold'>{parseFloat(cardAmount || 0).toFixed(2)} AZN</span>
									</div>
									<div className='flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2'>
										<span>Cəm:</span>
										<span>{(parseFloat(cashAmount || 0) + parseFloat(cardAmount || 0)).toFixed(2)} AZN</span>
									</div>
								</div>
							)}
						</>
					)}

					{error && (
						<div className='bg-red-50 border border-red-200 rounded-lg p-3'>
							<p className='text-red-600 text-sm font-medium'>{error}</p>
						</div>
					)}

					{showUnpaidReason && (
						<div className='space-y-3'>
							<label className='block text-sm font-medium text-gray-700'>Ödənişsiz bağlama səbəbi</label>
							<select
								value={unpaidReason}
								onChange={(e) => setUnpaidReason(e.target.value)}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
							>
								<option value=''>Səbəb seçin</option>
								<option value='guest_left'>Qonaq tərk etdi</option>
								<option value='company_account'>Şirkət hesabına</option>
								<option value='waiter_error'>Ofisiant səhvi</option>
								<option value='cancelled'>Ləğv edildi</option>
								<option value='other'>Digər</option>
							</select>
						</div>
					)}

					<div className='flex gap-3'>
						{!showUnpaidReason ? (
							<>
								<button
									onClick={() => setShowUnpaidReason(true)}
									className='flex-1 bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors text-lg font-bold'
								>
									Ödənişsiz bağla
								</button>
								<button
	onClick={handleComplete}
	disabled={isSubmitting}
	className='flex-1 bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed'
>
	{isSubmitting ? 'Göndərilir...' : 'Bağla'}
</button>
							</>
						) : (
							<>
								<button
									onClick={() => setShowUnpaidReason(false)}
									className='flex-1 bg-gray-600 text-white py-4 px-6 rounded-lg hover:bg-gray-700 transition-colors text-lg font-bold'
								>
									Ödənişə qayıt
								</button>
								<button
									onClick={() => {
										if (!unpaidReason) {
											setError('Səbəb seçin');
											return;
										}
										onUnpaidClose && onUnpaidClose(unpaidReason);
									}}
									className='flex-1 bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 transition-colors text-lg font-bold'
								>
									Təsdiq et
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
