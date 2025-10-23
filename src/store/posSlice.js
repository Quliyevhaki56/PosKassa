import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedTable: null,
  currentOrder: null, // Bu artıq orders table-dan gələcək
  tables: [],
  categories: [],
  products: [],
  loading: false,
  serviceCharge: 0,
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    setTables: (state, action) => {
      state.tables = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    
    // YENİ: Masanı seçəndə orders table-dan sifariş yüklə
    selectTable: (state, action) => {
      const table = state.tables.find(t => t.id === action.payload);
      state.selectedTable = table;
      // currentOrder-ı burada set etmə, ayrıca action ilə yüklənəcək
      state.currentOrder = null;
    },
    
    // YENİ: Orders table-dan gələn sifarişi set et
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    
    addItemToOrder: (state, action) => {
      const product = action.payload;

      if (!state.currentOrder) {
        // Yeni sifariş strukturu - orders table formatı
        state.currentOrder = {
          id: null, // Database-də yaradılacaq
          table_id: state.selectedTable.id,
          table_number: state.selectedTable.table_number,
          restaurant_id: state.selectedTable.restaurant_id,
          branch_id: state.selectedTable.branch_id,
          items: [],
          total_amount: 0,
          discount: 0,
          discount_type: null,
          tax: 0,
          service_charge: 0,
          status: 'pending',
          payment_status: 'unpaid',
          started_at: new Date().toISOString(),
        };
      }

      // Məhsul əlavə et - waiterDatabase formatına uyğun
      const existingItem = state.currentOrder.items.find(
        item => item.productId === product.id && (!item.status || item.status === 'pending')
      );

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
      } else {
        state.currentOrder.items.push({
          id: `item-${Date.now()}-${Math.random()}`,
          productId: product.id,
          name: product.name, // Ofisiant formatı
          productName: product.name, // Kassa formatı (backward compatible)
          price: product.price,
          quantity: 1,
          subtotal: product.price,
          status: 'pending',
          addedAt: new Date().toISOString(),
        });
      }

      posSlice.caseReducers.recalculateOrder(state);
    },
    
    updateItemQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      const item = state.currentOrder.items.find(i => i.id === itemId);

      if (item) {
        if (quantity <= 0) {
          state.currentOrder.items = state.currentOrder.items.filter(
            i => i.id !== itemId
          );
        } else {
          item.quantity = quantity;
          item.subtotal = item.quantity * item.price;
        }
        posSlice.caseReducers.recalculateOrder(state);
      }
    },
    
    removeItemFromOrder: (state, action) => {
      const itemId = action.payload;
      state.currentOrder.items = state.currentOrder.items.filter(
        i => i.id !== itemId
      );
      posSlice.caseReducers.recalculateOrder(state);
    },
    
    applyDiscount: (state, action) => {
      const { type, value } = action.payload;
      state.currentOrder.discount_type = type;

      const subtotal = state.currentOrder.items.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      if (type === 'percentage') {
        state.currentOrder.discount = (subtotal * value) / 100;
      } else {
        state.currentOrder.discount = value;
      }

      posSlice.caseReducers.recalculateOrder(state);
    },
    
    recalculateOrder: (state) => {
      if (!state.currentOrder) return;

      // Subtotal hesabla
      const subtotal = state.currentOrder.items.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      const afterDiscount = subtotal - state.currentOrder.discount;

      // Service charge
      const serviceChargeAmount = (afterDiscount * state.serviceCharge) / 100;

      // Tax (18%)
      const taxRate = 18;
      const taxAmount = (afterDiscount * taxRate) / 100;

      // Total
      state.currentOrder.total_amount = afterDiscount + taxAmount + serviceChargeAmount;
      state.currentOrder.tax = taxAmount;
      state.currentOrder.service_charge = serviceChargeAmount;
      
      // Backward compatibility üçün
      state.currentOrder.subtotal = subtotal;
      state.currentOrder.total = state.currentOrder.total_amount;
    },
    
    clearOrder: (state) => {
      state.currentOrder = null;
    },
    
    updateTableInList: (state, action) => {
      const updatedTable = action.payload;
      const index = state.tables.findIndex(t => t.id === updatedTable.id);
      if (index !== -1) {
        state.tables[index] = updatedTable;
      }
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setServiceCharge: (state, action) => {
      state.serviceCharge = action.payload;
      posSlice.caseReducers.recalculateOrder(state);
    },
  },
});

export const {
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
  setLoading,
  recalculateOrder,
  setServiceCharge,
} = posSlice.actions;

export default posSlice.reducer;