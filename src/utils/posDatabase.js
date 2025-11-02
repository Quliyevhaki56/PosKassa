import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const getRestaurantData = async (restaurantId) => {
	const { data, error } = await supabase.from('restaurants').select('*').eq('id', restaurantId).maybeSingle();

	if (error) throw error;
	return data;
};

export const getTables = async (restaurantId) => {
	const { data, error } = await supabase.from('tables').select('*').eq('restaurant_id', restaurantId).order('table_number');

	if (error) throw error;
	return data || [];
};

export const getTable = async (restaurantId, tableId) => {
	const { data, error } = await supabase.from('tables').select('*').eq('restaurant_id', restaurantId).eq('id', tableId).maybeSingle();

	if (error) throw error;
	return data;
};

// YENİ: Orders table-dan aktiv sifarişi əldə et
export const getTableOrder = async (tableId) => {
	const { data, error } = await supabase
		.from('orders')
		.select('*')
		.eq('table_id', tableId)
		.not('status', 'in', '(completed,cancelled)')
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error && error.code !== 'PGRST116') {
		throw error;
	}

	return data;
};

// YENİ: Sifariş yarat və ya mövcudu əldə et
export const createOrGetOrder = async (restaurantId, branchId, tableId, tableNumber, cashierId) => {
	// Əvvəlcə aktiv sifariş var mı?
	let order = await getTableOrder(tableId);
	console.log("Order: ", order)
	if (order) {
		return order;
	}

	// Yoxdursa yeni yarat
	const { data, error } = await supabase
		.from('orders')
		.insert([
			{
				restaurant_id: restaurantId,
				branch_id: branchId,
				table_id: tableId,
				table_number: tableNumber,
				waiter_id: cashierId, // Kassa üçün cashier_id
				status: 'pending',
				items: [],
				total_amount: 0,
				discount: 0,
				discount_type: null,
				tax: 0,
				payment_status: 'unpaid',
				payment_method: null,
				notes: '',
				created_at: new Date().toISOString(),
				started_at: new Date().toISOString(),
			},
		])
		.select()
		.single();

	if (error) {
		// Duplicate xətası varsa mövcud sifarişi gətir
		if (error.code === '23505') {
			await new Promise(resolve => setTimeout(resolve, 100));
			order = await getTableOrder(tableId);
			if (order) return order;
		}
		throw error;
	}

	return data;
};

// YENİ: Sifarişi yenilə
export const updateOrder = async (orderId, updates) => {
	const { data, error } = await supabase
		.from('orders')
		.update(updates)
		.eq('id', orderId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

// DEĞİŞDİ: Artıq orders table istifadə edir
export const updateTableOrder = async (restaurantId, tableId, order) => {
	// Əgər order varsa və id varsa, orders table-da yenilə
	if (order && order.id) {
		await updateOrder(order.id, {
			items: order.items,
			total_amount: order.total_amount || order.total,
			discount: order.discount,
			discount_type: order.discount_type || order.discountType,
			tax: order.tax,
			service_charge: order.service_charge || order.serviceCharge,
		});
	}

	// Table statusunu yenilə
	const status = order && order.items && order.items.length > 0 ? 'occupied' : 'empty';
	const { data, error } = await supabase
		.from('tables')
		.update({
			status: status,
			updated_at: new Date().toISOString(),
		})
		.eq('restaurant_id', restaurantId)
		.eq('id', tableId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const addCompletedOrder = async (restaurantId, order, cashierId, branchId, cashierName, isUnpaid = false, unpaidReason = null) => {
	// Duplicate check üçün: table_id + completed_at kombinasiyası (son 5 saniyə)
	const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
	console.log("COMPLETED ORDERS")
	const { data: recentCompleted } = await supabase
		.from('completed_orders')
		.select('id')
		.eq('table_id', order.table_id || order.tableId)
		.eq('table_number', order.table_number || order.tableNumber)
		.gte('completed_at', fiveSecondsAgo)
		.maybeSingle();
	
	if (recentCompleted) {
		console.log('Bu masa üçün son 5 saniyədə sifariş tamamlanıb, duplicate yaradılmır');
		return recentCompleted;
	}

	// Completed_orders table-a əlavə et (reporting üçün)
	const { data, error } = await supabase
		.from('completed_orders')
		.insert({
			restaurant_id: restaurantId,
			branch_id: branchId,
			table_id: order.table_id || order.tableId,
			table_number: order.table_number || order.tableNumber,
			items: order.items,
			subtotal: order.subtotal || order.items.reduce((sum, i) => sum + i.subtotal, 0),
			discount: order.discount || 0,
			discount_type: order.discount_type || order.discountType,
			tax: order.tax || 0,
			service_charge: order.service_charge || order.serviceCharge || 0,
			total: order.total_amount || order.total,
			payment_method: order.paymentMethod || (isUnpaid ? 'unpaid' : null),
			payment_details: order.paymentDetails || (isUnpaid ? { unpaid_reason: unpaidReason } : null),
			started_at: order.started_at || order.startedAt,
			completed_at: new Date().toISOString(),
			cashier_id: cashierId,
			cashier_name: cashierName,
			is_unpaid: isUnpaid,
			unpaid_reason: unpaidReason,
		})
		.select()
		.single();

	if (error) {
		console.error('addCompletedOrder error:', error);
		throw error;
	}
	
	return data;
};

export const clearTableOrder = async (restaurantId, tableId) => {
	// Orders table-da aktiv sifarişi completed et
	const order = await getTableOrder(tableId);
	if (order) {
		await supabase
			.from('orders')
			.update({ status: 'cancelled' })
			.eq('id', order.id);
	}

	// Table-ı təmizlə
	const { data, error } = await supabase
		.from('tables')
		.update({
			status: 'empty',
			updated_at: new Date().toISOString(),
		})
		.eq('restaurant_id', restaurantId)
		.eq('id', tableId)
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const getProducts = async (restaurantId) => {
	const { data, error } = await supabase.from('products').select('*').eq('restaurant_id', restaurantId).eq('is_active', true).order('sort_order');

	if (error) throw error;
	return data || [];
};

export const getCategories = async (restaurantId) => {
	const { data, error } = await supabase.from('categories').select('*').eq('restaurant_id', restaurantId).eq('is_active', true).order('sort_order');

	if (error) throw error;
	return data || [];
};

export const getUserByUsername = async (username) => {
	const { data, error } = await supabase.from('users').select('*, restaurants(*)').eq('username', username).eq('is_active', true).maybeSingle();

	if (error) throw error;
	return data;
};

export const subscribeToTables = (restaurantId, callback) => {
	const subscription = supabase
		.channel('tables_changes')
		.on('postgres_changes', { event: '*', schema: 'public', table: 'tables', filter: `restaurant_id=eq.${restaurantId}` }, (payload) => {
			callback(payload);
		})
		.subscribe();

	return subscription;
};

// YENİ: Orders table-a da subscribe ol
export const subscribeToOrders = (restaurantId, callback) => {
	const subscription = supabase
		.channel('orders_changes')
		.on('postgres_changes', { 
			event: '*', 
			schema: 'public', 
			table: 'orders', 
			filter: `restaurant_id=eq.${restaurantId}` 
		}, (payload) => {
			callback(payload);
		})
		.subscribe();

	return subscription;
};

export const saveToLocalStorage = (key, data) => {
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error('Error saving to localStorage:', error);
	}
};

export const getFromLocalStorage = (key) => {
	try {
		const data = localStorage.getItem(key);
		return data ? JSON.parse(data) : null;
	} catch (error) {
		console.error('Error reading from localStorage:', error);
		return null;
	}
};

export const getHalls = async (restaurantId, branchId) => {
	const { data, error } = await supabase
		.from('halls')
		.select('*')
		.eq('restaurant_id', restaurantId)
		.eq('branch_id', branchId)
		.eq('is_active', true)
		.order('name');

	if (error) throw error;
	return data || [];
};

export const getTablesByHall = async (restaurantId, hallId) => {
	const { data, error } = await supabase.from('tables').select('*').eq('restaurant_id', restaurantId).eq('hall_id', hallId).order('table_number');

	if (error) throw error;
	return data || [];
};

export const handleSendToKitchen = async (currentOrder, selectedTable) => {
	try {
		if (!currentOrder.id) {
			toast.error('Sifariş ID tapılmadı');
			return currentOrder;
		}

		const updatedItems = currentOrder.items.map(item => {
			if (!item.status || item.status === 'pending') {
				return { ...item, status: 'sent_to_kitchen' };
			}
			return item;
		});

		await supabase
			.from('orders')
			.update({
				items: updatedItems,
				status: 'in_progress',
				sent_to_kitchen_at: new Date().toISOString()
			})
			.eq('id', currentOrder.id);

		const groupedByDepartment = {};
		updatedItems.forEach(item => {
			const deptId = item.department_id || 'default';
			if (!groupedByDepartment[deptId]) {
				groupedByDepartment[deptId] = [];
			}
			groupedByDepartment[deptId].push(item);
		});

		for (const [deptId, items] of Object.entries(groupedByDepartment)) {
			await supabase.from('kitchen_orders').insert({
				order_id: currentOrder.id,
				department_id: deptId === 'default' ? null : deptId,
				items: items,
				status: 'pending',
				table_number: selectedTable.table_number,
				notes: currentOrder.notes || ''
			});
		}

		await supabase
			.from('tables')
			.update({
				status: 'occupied',
				updated_at: new Date().toISOString()
			})
			.eq('id', selectedTable.id);

		toast.success('Sifariş mətbəxə göndərildi');

		return { ...currentOrder, items: updatedItems, status: 'in_progress' };
	} catch (error) {
		toast.error('Xəta baş verdi');
		console.error(error);
		return currentOrder;
	}
};