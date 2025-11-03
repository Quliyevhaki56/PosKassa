import { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock, Printer, ArrowLeft, Lock } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import {
	setTables,
	setCategories,
	setProducts,
	selectTable,
	setCurrentOrder,
	addItemToOrder,
	updateItemQuantity,
	removeItemFromOrder,
	applyDiscount,
	clearOrder,
	updateTableInList,
	setServiceCharge,
} from '../store/posSlice';
import { logout } from '../store/authSlice';
import { supabase } from '../lib/supabase';
import { 
	getTables, 
	getCategories, 
	getProducts, 
	getTableOrder,
	createOrGetOrder,
	updateOrder,
	updateTableOrder, 
	addCompletedOrder, 
	clearTableOrder, 
	subscribeToTables,
	subscribeToOrders,
	getHalls, 
	handleSendToKitchen 
} from '../utils/posDatabase';
import TableGrid from '../components/tables/TableGrid';
import MenuGrid from '../components/menu/MenuGrid';
import OrderPanel from '../components/order/OrderPanel';
import DiscountModal from '../components/modals/DiscountModal';
import PaymentModal from '../components/modals/PaymentModal';
import TransferModal from '../components/modals/TransferModal';
import CommentModal from '../components/modals/CommentModal';
import Receipt from '../components/receipt/Receipt';
import { format } from 'date-fns';

export default function POSDashboard() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user, restaurant } = useSelector((state) => state.auth);
	const { tables, categories, products, selectedTable, currentOrder, serviceCharge } = useSelector((state) => state.pos);
 
	const [halls, setHalls] = useState([]);
	const [activeHall, setActiveHall] = useState(null);
	const [activeCategory, setActiveCategory] = useState(null);
	const [showDiscountModal, setShowDiscountModal] = useState(false);
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [showTransferModal, setShowTransferModal] = useState(false);
	const [showCommentModal, setShowCommentModal] = useState(false);
	const [paymentType, setPaymentType] = useState(null);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [completedOrderForReceipt, setCompletedOrderForReceipt] = useState(null);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	const receiptRef = useRef();
	const tableSubscription = useRef(null);
	const orderSubscription = useRef(null);

	const handlePrint = useReactToPrint({
		content: () => receiptRef.current,
	});

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		if (selectedTable?.id) {
			localStorage.setItem('selectedTableId', selectedTable.id);
		}
	}, [selectedTable?.id]);

	useEffect(() => {
		if (!user || !restaurant) {
			navigate('/pos/login');
			return;
		}

		loadData();
	}, [user, restaurant]);


	useEffect(() => {
		updateCustomerDisplay();
	}, [currentOrder, restaurant]);

	// Tables real-time subscription
	useEffect(() => {
		if (!restaurant?.id) return;

		tableSubscription.current = subscribeToTables(restaurant.id, (payload) => {
			if (payload.eventType === 'UPDATE') {
				dispatch(updateTableInList(payload.new));

				if (selectedTable && payload.new.id === selectedTable.id) {
					dispatch(selectTable(payload.new.id));
				}
			} else if (payload.eventType === 'INSERT') {
				dispatch(setTables([...tables, payload.new]));
			}
		});

		return () => {
			if (tableSubscription.current) {
				supabase.removeChannel(tableSubscription.current);
			}
		};
	}, [restaurant?.id, selectedTable?.id]);

	// Orders real-time subscription
	useEffect(() => {
		if (!restaurant?.id || !selectedTable?.id) return;

		orderSubscription.current = subscribeToOrders(restaurant.id, async (payload) => {
			// Əgər seçilmiş masanın sifarişi dəyişibsə, yenilə
			if (payload.new?.table_id === selectedTable.id) {
				const order = await getTableOrder(selectedTable.id);
				dispatch(setCurrentOrder(order));
			}
		});

		return () => {
			if (orderSubscription.current) {
				supabase.removeChannel(orderSubscription.current);
			}
		};
	}, [restaurant?.id, selectedTable?.id]);

	const loadData = async () => {
		try {
			const [hallsData, categoriesData, productsData] = await Promise.all([
				getHalls(restaurant.id, user.branch_id),
				getCategories(restaurant.id),
				getProducts(restaurant.id),
			]);

			setHalls(hallsData);
			if (hallsData.length > 0) {
				const firstHall = hallsData[0];
				setActiveHall(firstHall.id);
				dispatch(setServiceCharge(firstHall.service_charge || 0));
				const tablesData = await getTables(restaurant.id);
				const filteredTables = tablesData.filter(t => t.hall_id === firstHall.id);
				dispatch(setTables(filteredTables));

				const savedTableId = localStorage.getItem('selectedTableId');
				if (savedTableId && filteredTables.some(t => t.id === savedTableId)) {
					const savedTable = filteredTables.find(t => t.id === savedTableId);
					dispatch(selectTable(savedTable));
					const order = await getTableOrder(savedTable.id);
					if (order) {
						dispatch(setCurrentOrder(order));
					}
				}
			}

			dispatch(setCategories(categoriesData));
			dispatch(setProducts(productsData));
		} catch (error) {
			console.error('Error loading data:', error);
			toast.error('Məlumatlar yüklənə bilmədi');
		}
	};

	const updateCustomerDisplay = () => {
		try {
			const displayData = {
				restaurant,
				currentOrder,
			};
			localStorage.setItem('customerDisplay', JSON.stringify(displayData));
		} catch (error) {
			console.error('Error updating customer display:', error);
		}
	};

	const handleSelectTable = async (tableId) => {
		try {
			// Əvvəlki masanı saxla
			if (selectedTable && currentOrder && currentOrder.items?.length > 0 && currentOrder.id) {
				await updateTableOrder(restaurant.id, selectedTable.id, currentOrder);
			}

			// Yeni masanı seç
			dispatch(selectTable(tableId));

			// Orders table-dan aktiv sifarişi yüklə
			const order = await getTableOrder(tableId);
			dispatch(setCurrentOrder(order));

		} catch (error) {
			console.error('Error selecting table:', error);
			toast.error('Masa seçilə bilmədi');
		}
	};

	const handleBackToTables = async () => {
		try {
			if (currentOrder && currentOrder.items?.length > 0 && currentOrder.id) {
				await updateTableOrder(restaurant.id, selectedTable.id, currentOrder);
			} else if (selectedTable && (!currentOrder || !currentOrder.items || currentOrder.items.length === 0)) {
				await supabase
					.from('tables')
					.update({
						status: 'empty',
						updated_at: new Date().toISOString()
					})
					.eq('id', selectedTable.id);
			}
			dispatch(selectTable(null));
			dispatch(setCurrentOrder(null));
			await loadData();
		} catch (error) {
			console.error('Error:', error);
		}
	};

	const handleHallChange = async (hallId) => {
		try {
			setActiveHall(hallId);
			const hall = halls.find(h => h.id === hallId);
			if (hall) {
				dispatch(setServiceCharge(hall.service_charge || 0));
			}
			const tablesData = await getTables(restaurant.id);
			const filteredTables = tablesData.filter(t => t.hall_id === hallId);
			dispatch(setTables(filteredTables));
			dispatch(selectTable(null));
			dispatch(setCurrentOrder(null));
		} catch (error) {
			console.error('Error loading hall tables:', error);
			toast.error('Zal məlumatları yüklənə bilmədi');
		}
	};

	const handleAddProduct = async (product) => {
		if (!selectedTable) {
			toast.error('Əvvəlcə masa seçin');
			return;
		}

		try {
			// 1. Əvvəlcə database-dən aktual sifarişi əldə et
			let order = await getTableOrder(selectedTable.id);
			
			if (!order) {
				// Yeni sifariş yarat
				order = await createOrGetOrder(
					restaurant.id,
					user.branch_id,
					selectedTable.id,
					selectedTable.table_number,
					user.id
				);
			}

			// 2. Mövcud items array-ini əldə et
			const currentItems = order.items || [];

			// 3. Məhsul artıq var mı? (pending statusda)
			const existingItemIndex = currentItems.findIndex(
				item => item.productId === product.id && (!item.status || item.status === 'pending')
			);

			let updatedItems;
			if (existingItemIndex >= 0) {
				// Mövcud məhsulun miqdarını artır
				updatedItems = [...currentItems];
				updatedItems[existingItemIndex].quantity += 1;
				updatedItems[existingItemIndex].subtotal = 
					updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
			} else {
				// Yeni məhsul əlavə et
				const newItem = {
					id: `item-${Date.now()}-${Math.random()}`,
					productId: product.id,
					name: product.name,
					productName: product.name,
					price: product.price,
					quantity: 1,
					subtotal: product.price,
					status: 'pending',
					addedAt: new Date().toISOString(),
				};
				updatedItems = [...currentItems, newItem];
			}

			// 4. Hesablamaları yap (serviceCharge Redux-dan)
			const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
			const discount = order.discount || 0;
			const afterDiscount = subtotal - discount;
			const serviceChargeAmount = (afterDiscount * (serviceCharge || 0)) / 100;
			const taxAmount = (afterDiscount * 18) / 100;
			const totalAmount = afterDiscount + taxAmount + serviceChargeAmount;

			// 5. Database-i yenilə (service_charge OLMADAN)
			const updatedOrder = await updateOrder(order.id, {
				items: updatedItems,
				total_amount: totalAmount,
				tax: taxAmount,
			});

			// 6. Redux state-i yenilə (service_charge əlavə et)
			dispatch(setCurrentOrder({
				...updatedOrder,
				subtotal: subtotal,
				total: totalAmount,
				service_charge: serviceChargeAmount,
				serviceCharge: serviceChargeAmount,
			}));

			toast.success(`${product.name} əlavə edildi`);
		} catch (error) {
			console.error('Error adding product:', error);
			toast.error('Məhsul əlavə edilə bilmədi');
		}
	};

	const handleUpdateQuantity = async (itemId, quantity) => {
		if (!currentOrder?.id) return;

		try {
			// Database-dən aktual sifarişi əldə et
			const order = await getTableOrder(selectedTable.id);
			if (!order) return;

			const updatedItems = order.items.map(item => {
				if (item.id === itemId && (!item.status || item.status === 'pending')) {
					if (quantity <= 0) {
						return null; // Silinəcək
					}
					return {
						...item,
						quantity: quantity,
						subtotal: quantity * item.price
					};
				}
				return item;
			}).filter(item => item !== null);

			// Hesablamalar (serviceCharge Redux-dan)
			const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
			const discount = order.discount || 0;
			const afterDiscount = subtotal - discount;
			const serviceChargeAmount = (afterDiscount * (serviceCharge || 0)) / 100;
			const taxAmount = (afterDiscount * 18) / 100;
			const totalAmount = afterDiscount + taxAmount + serviceChargeAmount;

			// Database yenilə (service_charge OLMADAN)
			const updatedOrder = await updateOrder(order.id, {
				items: updatedItems,
				total_amount: totalAmount,
				tax: taxAmount,
			});

			// Redux yenilə (service_charge əlavə et)
			dispatch(setCurrentOrder({
				...updatedOrder,
				subtotal: subtotal,
				total: totalAmount,
				service_charge: serviceChargeAmount,
				serviceCharge: serviceChargeAmount,
			}));

		} catch (error) {
			console.error('Error updating quantity:', error);
			toast.error('Xəta baş verdi');
		}
	};

	const handleRemoveItem = async (itemId) => {
		if (!currentOrder?.id) return;

		try {
			// Database-dən aktual sifarişi əldə et
			const order = await getTableOrder(selectedTable.id);
			if (!order) return;

			// Item-i sil (yalnız pending olanları)
			const updatedItems = order.items.filter(
				item => !(item.id === itemId && (!item.status || item.status === 'pending'))
			);

			// Hesablamalar (serviceCharge Redux-dan)
			const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
			const discount = order.discount || 0;
			const afterDiscount = subtotal - discount;
			const serviceChargeAmount = (afterDiscount * (serviceCharge || 0)) / 100;
			const taxAmount = (afterDiscount * 18) / 100;
			const totalAmount = afterDiscount + taxAmount + serviceChargeAmount;

			// Database yenilə (service_charge OLMADAN)
			const updatedOrder = await updateOrder(order.id, {
				items: updatedItems,
				total_amount: totalAmount,
				tax: taxAmount,
			});

			// Redux yenilə (service_charge əlavə et)
			dispatch(setCurrentOrder({
				...updatedOrder,
				subtotal: subtotal,
				total: totalAmount,
				service_charge: serviceChargeAmount,
				serviceCharge: serviceChargeAmount,
			}));

			toast.success('Məhsul silindi');
		} catch (error) {
			console.error('Error removing item:', error);
			toast.error('Xəta baş verdi');
		}
	};

	const handleClearOrder = async () => {
		if (!window.confirm('Sifarişi ləğv etmək istədiyinizə əminsiniz?')) {
			return;
		}

		try {
			await clearTableOrder(restaurant.id, selectedTable.id);
			dispatch(clearOrder());
			await loadData();
			toast.success('Sifariş ləğv edildi');
		} catch (error) {
			console.error('Error clearing order:', error);
			toast.error('Xəta baş verdi');
		}
	};

	const handleApplyDiscount = async (type, value) => {
		if (!currentOrder?.id) return;

		try {
			// Database-dən aktual sifarişi əldə et
			const order = await getTableOrder(selectedTable.id);
			if (!order) return;

			const subtotal = order.items.reduce((sum, item) => sum + item.subtotal, 0);
			
			// Endirim hesabla
			let discountAmount = 0;
			if (type === 'percentage') {
				discountAmount = (subtotal * value) / 100;
			} else {
				discountAmount = value;
			}

			const afterDiscount = subtotal - discountAmount;
			const serviceChargeAmount = (afterDiscount * (serviceCharge || 0)) / 100;
			const taxAmount = (afterDiscount * 18) / 100;
			const totalAmount = afterDiscount + taxAmount + serviceChargeAmount;

			// Database yenilə (service_charge OLMADAN)
			const updatedOrder = await updateOrder(order.id, {
				discount: discountAmount,
				discount_type: type,
				total_amount: totalAmount,
				tax: taxAmount,
			});

			// Redux yenilə (service_charge əlavə et)
			dispatch(setCurrentOrder({
				...updatedOrder,
				subtotal: subtotal,
				total: totalAmount,
				discountType: type,
				service_charge: serviceChargeAmount,
				serviceCharge: serviceChargeAmount,
			}));

			toast.success('Endirim tətbiq edildi');
		} catch (error) {
			console.error('Error applying discount:', error);
			toast.error('Xəta baş verdi');
		}
	};

	const handleOpenPayment = (type) => {
		setIsProcessingPayment(false);
		setPaymentType(type);
		setShowPaymentModal(true);
	};

const handleCompletePayment = async (paymentDetails) => {
  if (isProcessingPayment) {
    console.log("Ödəniş artıq işlənir, gözləyin...");
    return;
  }

  setIsProcessingPayment(true);

  try {
    const completedOrder = {
      ...currentOrder,
      paymentMethod: paymentDetails.paymentMethod,
      paymentDetails,
      completedAt: new Date().toISOString(),
    };

    await addCompletedOrder(restaurant.id, completedOrder, user.id, user.branch_id, user.full_name);
    await clearTableOrder(restaurant.id, selectedTable.id);
    dispatch(clearOrder());
    setCompletedOrderForReceipt(completedOrder);
    await loadData();
    setShowPaymentModal(false);
    toast.success('Ödəniş tamamlandı');

    setTimeout(() => handlePrint(), 500);
  } catch (error) {
    console.error('Error completing payment:', error);
    toast.error('Xəta baş verdi');
  } finally {
    setIsProcessingPayment(false);
  }
};
 

	const handleUnpaidClose = async (unpaidReason) => {
		if (isProcessingPayment) {
			console.log('Ödəniş artıq işlənir, gözləyin...');
			return;
		}

		setIsProcessingPayment(true);

		try {
			const completedOrder = {
				...currentOrder,
				completedAt: new Date().toISOString(),
			};

			await addCompletedOrder(restaurant.id, completedOrder, user.id, user.branch_id, user.full_name, true, unpaidReason);
      console.log("Zart")

			await clearTableOrder(restaurant.id, selectedTable.id);

			dispatch(clearOrder());

			await loadData();

			setShowPaymentModal(false);

			toast.success('Sifariş ödənişsiz bağlandı');
		} catch (error) {
			console.error('Error closing unpaid order:', error);
			toast.error('Xəta baş verdi');
		} finally {
			setIsProcessingPayment(false);
		}
	};

	const handleLogout = async () => {
		dispatch(logout());
		navigate('/pos/login');
	};

	const handleTransfer = async (toTableId, itemIds) => {
		try {
			if (!currentOrder?.id) return;

			const order = await getTableOrder(selectedTable.id);
			if (!order) return;

			const itemsToTransfer = order.items.filter(item => itemIds.includes(item.id));
			const itemsToKeep = order.items.filter(item => !itemIds.includes(item.id));

			if (itemsToKeep.length === 0) {
				toast.error('Ən azı bir məhsul qalmalıdır');
				return;
			}

			const currentSubtotal = itemsToKeep.reduce((sum, item) => sum + item.subtotal, 0);
			const discount = order.discount || 0;
			const afterDiscount = currentSubtotal - discount;
			const serviceChargeAmount = (afterDiscount * (serviceCharge || 0)) / 100;
			const taxAmount = (afterDiscount * 18) / 100;
			const newTotal = afterDiscount + taxAmount + serviceChargeAmount;

			await updateOrder(order.id, {
				items: itemsToKeep,
				total_amount: newTotal,
				tax: taxAmount,
			});

			const toTableOrder = await getTableOrder(toTableId);
			if (toTableOrder) {
				const transferredSubtotal = itemsToTransfer.reduce((sum, item) => sum + item.subtotal, 0);
				const toTableSubtotal = toTableOrder.items.reduce((sum, item) => sum + item.subtotal, 0) + transferredSubtotal;
				const toTableTax = (toTableSubtotal * 18) / 100;
				const toTableTotal = toTableSubtotal + toTableTax;

				await updateOrder(toTableOrder.id, {
					items: [...toTableOrder.items, ...itemsToTransfer],
					total_amount: toTableTotal,
					tax: toTableTax,
				});
			} else {
				const transferredSubtotal = itemsToTransfer.reduce((sum, item) => sum + item.subtotal, 0);
				const toTableTax = (transferredSubtotal * 18) / 100;
				const toTableTotal = transferredSubtotal + toTableTax;

				const newOrder = await createOrGetOrder(toTableId, {
					items: itemsToTransfer,
					total_amount: toTableTotal,
					tax: toTableTax,
				});
			}

			dispatch(setCurrentOrder({
				...order,
				items: itemsToKeep,
				total: newTotal,
				subtotal: currentSubtotal,
				service_charge: serviceChargeAmount,
			}));

			setShowTransferModal(false);
			toast.success('Məhsullar ötürüldü');
		} catch (error) {
			console.error('Error transferring items:', error);
			toast.error('Ötürmə xətası');
		}
	};

	const handleSaveComment = async (comment) => {
		try {
			if (!currentOrder?.id) return;

			await updateOrder(currentOrder.id, {
				notes: comment,
			});

			dispatch(setCurrentOrder({
				...currentOrder,
				notes: comment,
			}));

			setShowCommentModal(false);
			toast.success('Qeyd yadda saxlanıldı');
		} catch (error) {
			console.error('Error saving comment:', error);
			toast.error('Xəta baş verdi');
		}
	};


	return (
		<div className='h-screen flex flex-col bg-gray-100'>
			<header className='bg-white border-b border-gray-200'>
				<div className='flex items-center justify-between px-4 py-2'>
					<div className='flex items-center space-x-3'>
						{selectedTable && (
							<button
								onClick={handleBackToTables}
								className='p-2 hover:bg-gray-100 rounded transition-colors'
							>
								<ArrowLeft className='w-5 h-5 text-gray-700' />
							</button>
						)}
						{selectedTable && (
							<div className='px-2 py-1 bg-gray-100 rounded text-sm font-medium'>
								{selectedTable.table_number}
							</div>
						)}
						{!selectedTable && halls.length > 0 && (
							<div className='flex items-center space-x-2'>
								{halls.map((hall) => (
									<button
										key={hall.id}
										onClick={() => handleHallChange(hall.id)}
										className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
											activeHall === hall.id
												? 'bg-blue-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{hall.name}
									</button>
								))}
							</div>
						)}
					</div>

					<div className='flex items-center space-x-2'>
						<span className='text-sm text-gray-600'>{format(currentTime, 'HH:mm')}</span>
						<button
							onClick={() => navigate('/pos/login')}
							className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center space-x-1'
						>
							<Lock className='w-4 h-4' />
							<span>Kilid</span>
						</button>
						<button
							onClick={handleLogout}
							className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors'
						>
							Çıxış
						</button>
					</div>
				</div>
			</header>

			<div className='flex-1 overflow-hidden'>
				{!selectedTable ? (
					<div className='h-full p-8 bg-gray-50 overflow-y-auto'>
						<TableGrid tables={tables} selectedTableId={null} onSelectTable={handleSelectTable} />
					</div>
				) : (
					<div className='flex h-full overflow-hidden'>
						<div className='w-1/3 bg-gray-50 border-r border-gray-200'>
							<OrderPanel
								selectedTable={selectedTable}
								currentOrder={currentOrder}
								onUpdateQuantity={handleUpdateQuantity}
								onRemove={handleRemoveItem}
								onClearOrder={handleClearOrder}
								onOpenDiscount={() => setShowDiscountModal(true)}
								onOpenPayment={handleOpenPayment}
								// onSendToKitchen={handleSendToKitchenWrapper}
								onOpenTransfer={() => setShowTransferModal(true)}
								onOpenComment={() => setShowCommentModal(true)}
								loadData={loadData}
								isProcessingPayment={isProcessingPayment}
							/>
						</div>

						<div className='flex-1 flex flex-col bg-white'>
							{activeCategory && (
								<div className='p-2 border-b border-gray-200'>
									<button
										onClick={() => setActiveCategory(null)}
										className='px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors'
									>
										Geri
									</button>
								</div>
							)}
							<MenuGrid
								categories={categories}
								products={products}
								activeCategory={activeCategory}
								onSelectCategory={setActiveCategory}
								onAddProduct={handleAddProduct}
							/>
						</div>
					</div>
				)}
			</div>

			<DiscountModal
				isOpen={showDiscountModal}
				onClose={() => setShowDiscountModal(false)}
				onApply={handleApplyDiscount}
				currentSubtotal={currentOrder?.subtotal || 0}
			/>

			<PaymentModal
				isOpen={showPaymentModal}
				onClose={() => setShowPaymentModal(false)}
				onComplete={handleCompletePayment}
				onUnpaidClose={handleUnpaidClose}
				order={currentOrder}
				paymentType={paymentType}
			/>

			<TransferModal
				isOpen={showTransferModal}
				onClose={() => setShowTransferModal(false)}
				onTransfer={handleTransfer}
				tables={tables}
				selectedTableId={selectedTable?.id}
			/>

			<CommentModal
				isOpen={showCommentModal}
				onClose={() => setShowCommentModal(false)}
				onSave={handleSaveComment}
				currentComment={currentOrder?.notes || ''}
			/>

			{completedOrderForReceipt && (
				<div className='hidden'>
					<Receipt ref={receiptRef} order={completedOrderForReceipt} restaurant={restaurant} tableNumber={selectedTable?.table_number} />
				</div>
			)}
		</div>
	);
}