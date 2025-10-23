import TableCard from './TableCard';

export default function TableGrid({ tables, selectedTableId, onSelectTable }) {
	if (tables.length === 0) {
		return (
			<div className='text-center py-12 text-gray-500'>
				<p>Heç bir masa tapılmadı</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6'>
			{tables.map((table) => (
				<TableCard key={table.id} table={table} isSelected={selectedTableId === table.id} onSelect={onSelectTable} />
			))}
		</div>
	);
}
