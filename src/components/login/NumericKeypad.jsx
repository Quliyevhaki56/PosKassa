import { Delete, ArrowRight } from 'lucide-react';

export default function NumericKeypad({ value, onChange, onSubmit, onBackspace }) {
	const handleNumberClick = (num) => {
		if (value.length < 6) {
			onChange(value + num);
		}
	};

	const handleBackspace = () => {
		onBackspace();
	};

	const handleSubmit = () => {
		if (value.length >= 4) {
			onSubmit();
		}
	};

	const numbers = [
		['1', '2', '3'],
		['4', '5', '6'],
		['7', '8', '9'],
	];

	return (
		<div className='w-full max-w-sm mx-auto'>
			<div className='grid grid-cols-3 gap-3 mb-3'>
				{numbers.map((row, rowIndex) => (
					row.map((num) => (
						<button
							key={num}
							onClick={() => handleNumberClick(num)}
							className='aspect-square bg-white border-2 border-gray-300 rounded-xl text-3xl font-bold text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm'
						>
							{num}
						</button>
					))
				))}
			</div>

			<div className='grid grid-cols-3 gap-3'>
				<button
					onClick={handleBackspace}
					className='aspect-square bg-red-50 border-2 border-red-300 rounded-xl flex items-center justify-center hover:bg-red-100 active:bg-red-200 transition-colors shadow-sm'
				>
					<Delete className='w-8 h-8 text-red-600' />
				</button>

				<button
					onClick={() => handleNumberClick('0')}
					className='aspect-square bg-white border-2 border-gray-300 rounded-xl text-3xl font-bold text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm'
				>
					0
				</button>

				<button
					onClick={handleSubmit}
					disabled={value.length < 4}
					className='aspect-square bg-green-50 border-2 border-green-300 rounded-xl flex items-center justify-center hover:bg-green-100 active:bg-green-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
				>
					<ArrowRight className='w-8 h-8 text-green-600' />
				</button>
			</div>
		</div>
	);
}
