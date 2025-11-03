import { X } from 'lucide-react';

export default function TransferModal({ isOpen, onClose, onTransfer, tables, selectedTableId }) {
	if (!isOpen) return null;

	const availableTables = tables.filter(t => t.id !== selectedTableId && t.status === 'empty');

	const handleTransfer = (targetTableId) => {
		onTransfer(targetTableId);
		onClose();
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden'>
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<h2 className='text-2xl font-bold text-gray-800'>Sifarişi transfer et</h2>
					<button onClick={onClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
						<X className='w-6 h-6' />
					</button>
				</div>

				<div className='p-6 overflow-y-auto max-h-[calc(80vh-120px)]'>
					{availableTables.length === 0 ? (
						<div className='text-center py-12 text-gray-500'>
							<p>Transfer üçün boş masa yoxdur</p>
						</div>
					) : (
						<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4'>
							{availableTables.map((table) => (
								<button
									key={table.id}
									onClick={() => handleTransfer(table.id)}
									className='p-4 border-2 border-green-300 bg-green-50 rounded-lg hover:bg-green-100 transition-colors'
								>
									<div className='text-xl font-bold text-gray-800'>{table.table_number}</div>
									<div className='text-xs text-gray-600 mt-1'>{table.capacity} nəfər</div>
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
