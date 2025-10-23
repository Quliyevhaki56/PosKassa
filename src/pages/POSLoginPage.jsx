import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { setUser, setRestaurant } from '../store/authSlice';

export default function POSLoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const handleLogin = async (e) => {
		e.preventDefault();

		if (!username || !password) {
			toast.error('Zəhmət olmasa bütün xanaları doldurun');
			return;
		}

		setLoading(true);
		try {
			// Users cədvəlindən username və password yoxla
			const { data: users, error } = await supabase
				.from('users')
				.select('*, restaurants(*)')
				.eq('username', username)
				.eq('password', password)
				.eq('role', 'cashier')
				.eq('is_active', true)
				.maybeSingle(); // .single() əvəzinə .maybeSingle()

			console.log('Supabase response:', { users, error });

			if (error) {
				console.error('Database error:', error);
				throw new Error('Verilənlər bazası xətası');
			}

			if (!users) {
				throw new Error('İstifadəçi adı və ya şifrə yanlışdır');
			}

			// User məlumatlarını saxla
			dispatch(setUser(users));
			dispatch(setRestaurant(users.restaurants));

			// localStorage-ə saxla (səhifə yeniləmə üçün)
			localStorage.setItem('pos_user', JSON.stringify(users));
			localStorage.setItem('pos_restaurant', JSON.stringify(users.restaurants));

			toast.success(`Xoş gəldiniz, ${users.full_name}`);
			navigate('/pos/dashboard');
		} catch (error) {
			console.error('Login error:', error);
			toast.error('İstifadəçi adı və ya şifrə yanlışdır');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4'>
			<div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
				<div className='text-center mb-8'>
					<div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4'>
						<LogIn className='w-8 h-8 text-white' />
					</div>
					<h1 className='text-3xl font-bold text-gray-800 mb-2'>Kassa Sistemi</h1>
					<p className='text-gray-600'>Kassir olaraq daxil olun</p>
				</div>

				<form onSubmit={handleLogin} className='space-y-6'>
					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>İstifadəçi adı</label>
						<input
							type='text'
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
							placeholder='kassir1'
							autoComplete='username'
							disabled={loading}
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>Şifrə</label>
						<input
							type='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
							placeholder='••••••••'
							autoComplete='current-password'
							disabled={loading}
						/>
					</div>

					<button
						type='submit'
						disabled={loading}
						className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{loading ? 'Daxil olunur...' : 'Daxil ol'}
					</button>
				</form>
			</div>
		</div>
	);
}
