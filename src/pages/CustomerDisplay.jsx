import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';

export default function CustomerDisplay() {
	const [displayData, setDisplayData] = useState(null);

	useEffect(() => {
		const loadDisplayData = () => {
			try {
				const storedData = localStorage.getItem('customerDisplay');
				if (storedData) {
					const data = JSON.parse(storedData);
					setDisplayData(data);
				}
			} catch (error) {
				console.error('Error loading display data:', error);
			}
		};

		loadDisplayData();

		const interval = setInterval(loadDisplayData, 1000);

		window.addEventListener('storage', loadDisplayData);

		return () => {
			clearInterval(interval);
			window.removeEventListener('storage', loadDisplayData);
		};
	}, []);

	const restaurant = displayData?.restaurant;
	const order = displayData?.currentOrder;
	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4'>
			<div className='max-w-4xl mx-auto'>
				<div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>
					<div className='bg-blue-600 text-white p-4 text-center'>
						{restaurant?.logo_url && <img src={restaurant.logo_url} alt={restaurant.name} className='w-32 h-32 mx-auto mb-4 object-contain' />}
						<h1 className='text-3xl font-bold mb-2'>{restaurant?.name || 'Restoran'}</h1>
						{restaurant?.phone && <p className='text-lg text-blue-100'>{restaurant.phone}</p>}
					</div>

					<div className='p-8'>
						{!order || !order.items || order.items.length === 0 ? (
							<div className='text-center py-16'>
								<ShoppingCart className='w-32 h-32 mx-auto text-gray-300 mb-6' />
								<h2 className='text-2xl font-bold text-gray-800 mb-4'>Xoş gəlmisiniz!</h2>
								<p className='text-xl text-gray-600'>Sifarişiniz hazırlanır...</p>
							</div>
						) : (
							<>
								<div className=''>
									<h2 className='text-xl font-bold text-gray-800 mb-6 text-center'>Sizin sifarişiniz</h2>

									<div className='flex aling-center justify-evenly '>
										<div className='space-y-4 w-[55%]'>
											{order.items.map((item, index) => (
												<div key={index} className='flex justify-between items-center bg-gray-50 rounded-lg p-3'>
													<div className='flex-1'>
														<div className='text-md font-semibold text-gray-800 mb-1'>
															{item.quantity}x {item.productName}
														</div>
														<div className='text-xs text-gray-600'>
															{item.price.toFixed(2)} {restaurant?.currency || 'AZN'}
														</div>
													</div>
													<div className='text-md font-bold text-blue-600'>
														{item.subtotal.toFixed(2)} {restaurant?.currency || 'AZN'}
													</div>
												</div>
											))}
										</div>

										<div className='bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-3 shadow-xl w-[40%]'>
											<div className='flex justify-between items-center mb-1'>
												{/* <span className='text-xl font-medium'>Ara cəm:</span> */}
												{/* <span className='text-xl font-bold'>
												{order.total_amount.toFixed(2)} {restaurant?.currency || 'AZN'}
											</span> */}
											</div>

											{order.discount > 0 && (
												<div className='flex justify-between items-center mb-4 text-green-200'>
													<span className='text-xl font-medium'>Endirim:</span>
													<span className='text-xl font-bold'>
														-{order.discount.toFixed(2)} {restaurant?.currency || 'AZN'}
													</span>
												</div>
											)}

											<div className='flex justify-between items-center mb-6'>
												<span className='text-lg font-medium'>ƏDV ({restaurant?.tax_rate || 18}%):</span>
												<span className='text-xl font-bold'>
													{order.tax.toFixed(2)} {restaurant?.currency || 'AZN'}
												</span>
											</div>

											<div className='border-t-2 border-white/30 pt-6'>
												<div className='flex justify-between items-center'>
													<span className='text-2xl font-bold'>ÜMUMI:</span>
													<span className='text-3xl font-bold'>{order.total_amount.toFixed(2)}</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							</>
						)}
					</div>

					<div className='bg-gray-100 px-8 py-6 text-center'>
						<p className='text-xl text-gray-600'>Bizi seçdiyiniz üçün təşəkkür edirik!</p>
					</div>
				</div>
			</div>
		</div>
	);
}
