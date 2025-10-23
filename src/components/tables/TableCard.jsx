import { Users, Square, Circle, Triangle, Hexagon, Table } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function TableCard({ table, isSelected, onSelect }) {
	const [orderTotal, setOrderTotal] = useState(null);

	useEffect(() => {
		if (table.status === 'occupied') {
			loadOrderTotal();
		} else {
			setOrderTotal(null);
		}
	}, [table.status, table.id]);

	const loadOrderTotal = async () => {
		try {
			const { data, error } = await supabase
				.from('orders')
				.select('total_amount')
				.eq('table_id', table.id)
				.not('status', 'in', '(completed,cancelled)')
				.maybeSingle();

			if (data && !error) {
				setOrderTotal(data.total_amount);
			}
		} catch (error) {
			console.error('Error loading order total:', error);
		}
	};

	const getStatusColor = () => {
		switch (table.status) {
			case 'empty':
				return 'bg-green-100 border-green-300 hover:bg-green-200';
			case 'occupied':
				return 'bg-red-100 border-red-300 hover:bg-red-200';
			case 'waiting_payment':
				return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
			default:
				return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
		}
	};

	const getStatusText = () => {
		switch (table.status) {
			case 'empty':
				return 'Boş';
			case 'occupied':
				return 'Məşğul';
			case 'waiting_payment':
				return 'Ödəniş gözləyir';
			default:
				return 'Rezerv';
		}
	};

	const getShapeIcon = () => {
		const iconProps = { className: 'w-10 h-10', strokeWidth: 1.5 };
		switch (table.shape?.toLowerCase()) {
			case 'square':
				return <Square {...iconProps} />;
			case 'circle':
				return <Circle {...iconProps} />;
			case 'triangle':
				return <Triangle {...iconProps} />;
			case 'hexagon':
				return <Hexagon {...iconProps} />;
			default:
				return <Table {...iconProps} />;
		}
	};

	return (
		<button
			onClick={() => onSelect(table.id)}
			className={`
        p-3 rounded-lg border-2 transition-all
        ${getStatusColor()}
        ${isSelected ? 'ring-4 ring-blue-500 shadow-lg' : 'shadow'}
      `}
		>
			<div className='flex flex-col items-center space-y-2'>
				<div className='text-gray-700'>{getShapeIcon()}</div>
				<div className='text-xl font-bold text-gray-800'>{table.table_number}</div>
				<div className='flex items-center text-xs text-gray-600'>
					<Users className='w-3 h-3 mr-1' />
					<span>{table.capacity} nəfər</span>
				</div>
				<div className='text-xs font-medium text-gray-700'>{getStatusText()}</div>
				{orderTotal && orderTotal > 0 && (
					<div className='text-sm font-bold text-blue-600 mt-1'>
						{orderTotal.toFixed(2)} AZN
					</div>
				)}
			</div>
		</button>
	);
}
