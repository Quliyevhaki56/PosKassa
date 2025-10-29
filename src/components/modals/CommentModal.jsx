import { useState } from 'react';
import { X } from 'lucide-react';

export default function CommentModal({ isOpen, onClose, onSave, currentComment }) {
	const [comment, setComment] = useState(currentComment || '');

	if (!isOpen) return null;

	const handleSave = () => {
		onSave(comment);
		onClose();
	};

	const handleClose = () => {
		setComment(currentComment || '');
		onClose();
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-xl shadow-2xl max-w-lg w-full'>
				<div className='flex items-center justify-between p-6 border-b border-gray-200'>
					<h2 className='text-2xl font-bold text-gray-800'>Qeyd əlavə et</h2>
					<button onClick={handleClose} className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
						<X className='w-6 h-6' />
					</button>
				</div>

				<div className='p-6'>
					<textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder='Mətbəx üçün qeyd daxil edin...'
						className='w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
						rows={6}
						autoFocus
					/>
				</div>

				<div className='flex gap-3 p-6 border-t border-gray-200'>
					<button
						onClick={handleClose}
						className='flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium'
					>
						Ləğv et
					</button>
					<button
						onClick={handleSave}
						className='flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
					>
						Yadda saxla
					</button>
				</div>
			</div>
		</div>
	);
}
