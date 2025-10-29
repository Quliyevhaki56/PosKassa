import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LogIn, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { setUser, setRestaurant } from '../store/authSlice';
import NumericKeypad from '../components/login/NumericKeypad';

export default function POSLoginPage() {
	const [step, setStep] = useState('restaurant');
	const [restaurantUsername, setRestaurantUsername] = useState('');
	const [restaurant, setRestaurantData] = useState(null);
	const [pinCode, setPinCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [attempts, setAttempts] = useState(0);
	const [lockoutUntil, setLockoutUntil] = useState(null);
	const navigate = useNavigate();
	const dispatch = useDispatch();
  
	useEffect(() => {
		const savedRestaurant = localStorage.getItem('pos_restaurant');
		if (savedRestaurant) {
			try {
				const restaurantData = JSON.parse(savedRestaurant);
				setRestaurantData(restaurantData);
				setRestaurantUsername(restaurantData.username || '');
				setStep('pin');
			} catch (error) {
				console.error('Error loading restaurant:', error);
			}
		}

		const savedLockout = localStorage.getItem('login_lockout');
		if (savedLockout) {
			const lockoutTime = new Date(savedLockout);
			if (lockoutTime > new Date()) {
				setLockoutUntil(lockoutTime);
			} else {
				localStorage.removeItem('login_lockout');
				localStorage.removeItem('login_attempts');
			}
		}

		const savedAttempts = localStorage.getItem('login_attempts');
		if (savedAttempts) {
			setAttempts(parseInt(savedAttempts));
		}
	}, []);

	useEffect(() => {
		if (lockoutUntil) {
			const timer = setInterval(() => {
				if (new Date() >= lockoutUntil) {
					setLockoutUntil(null);
					setAttempts(0);
					localStorage.removeItem('login_lockout');
					localStorage.removeItem('login_attempts');
				}
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [lockoutUntil]);

	const handleRestaurantSubmit = async (e) => {
		e.preventDefault();
console.log(restaurantUsername)
		if (!restaurantUsername) {
			toast.error('Restoran istifadəçi adını daxil edin');
			return;
		}

		setLoading(true);
		try {
			const { data: restaurantData, error } = await supabase
				.from('restaurants')
				.select('*')
				.eq('username', restaurantUsername)
				.maybeSingle();

			if (error) {
        console.log(restaurantUsername)
				console.error('Database error:', error);
				throw new Error('Verilənlər bazası xətası');
			}

			if (!restaurantData) {
				toast.error('Restoran tapılmadı');
				return;
			}

			setRestaurantData(restaurantData);
			localStorage.setItem('pos_restaurant', JSON.stringify(restaurantData));
			setStep('pin');
		} catch (error) {
			console.error('Restaurant lookup error:', error);
			toast.error('Xəta baş verdi');
		} finally {
			setLoading(false);
		}
	};

	const handlePinSubmit = async () => {
		if (lockoutUntil) {
			const remainingTime = Math.ceil((lockoutUntil - new Date()) / 1000);
			toast.error(`${Math.ceil(remainingTime / 60)} dəqiqə gözləyin`);
			return;
		}

		if (pinCode.length < 4) {
			toast.error('PIN kod ən azı 4 rəqəm olmalıdır');
			return;
		}

		setLoading(true);
		try {
			const { data: users, error } = await supabase
				.from('users')
				.select('*')
				.eq('restaurant_id', restaurant.id)
				.eq('pin_code', pinCode)
				.eq('is_active', true)
				.maybeSingle();

			if (error) {
				console.error('Database error:', error);
				throw new Error('Verilənlər bazası xətası');
			}

			if (!users) {
				const newAttempts = attempts + 1;
				setAttempts(newAttempts);
				localStorage.setItem('login_attempts', newAttempts.toString());

				if (newAttempts >= 3) {
					const lockout = new Date(Date.now() + 5 * 60 * 1000);
					setLockoutUntil(lockout);
					localStorage.setItem('login_lockout', lockout.toISOString());
					toast.error('3 yanlış cəhd. 5 dəqiqə gözləyin');
					setPinCode('');
					return;
				}

				toast.error(`Yanlış PIN kod. ${3 - newAttempts} cəhd qaldı`);
				setPinCode('');
				return;
			}

			setAttempts(0);
			localStorage.removeItem('login_attempts');
			localStorage.removeItem('login_lockout');

			dispatch(setUser(users));
			dispatch(setRestaurant(restaurant));

			localStorage.setItem('pos_user', JSON.stringify(users));
			localStorage.setItem('pos_restaurant', JSON.stringify(restaurant));

			toast.success(`Xoş gəldiniz, ${users.full_name}`);
			navigate('/pos/dashboard');
		} catch (error) {
			console.error('Login error:', error);
			toast.error('Xəta baş verdi');
			setPinCode('');
		} finally {
			setLoading(false);
		}
	};

	const handleBackToRestaurant = () => {
		setStep('restaurant');
		setPinCode('');
		setRestaurantData(null);
	};

	const getRemainingTime = () => {
		if (!lockoutUntil) return '';
		const remaining = Math.ceil((lockoutUntil - new Date()) / 1000);
		const minutes = Math.floor(remaining / 60);
		const seconds = remaining % 60;
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	if (step === 'restaurant') {
		return (
			<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4'>
				<div className='bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md'>
					<div className='text-center mb-8'>
						<div className='inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4'>
							<LogIn className='w-8 h-8 text-white' />
						</div>
						<h1 className='text-3xl font-bold text-gray-800 mb-2'>Kassa Sistemi</h1>
						<p className='text-gray-600'>Restoran istifadəçi adı</p>
					</div>

					<form onSubmit={handleRestaurantSubmit} className='space-y-6'>
						<div>
							<label className='block text-sm font-medium text-gray-700 mb-2'>Restoran istifadəçi adı</label>
							<input
								type='text'
								value={restaurantUsername}
								onChange={(e) => setRestaurantUsername(e.target.value)}
								className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg'
								placeholder='restaurant1'
								autoComplete='off'
								disabled={loading}
								autoFocus
							/>
						</div>

						<button
							type='submit'
							disabled={loading}
							className='w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? 'Yoxlanılır...' : 'Davam et'}
						</button>
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4'>
			<div className='bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl flex' style={{ height: '600px' }}>
				<div className='w-3/5 bg-gray-100 flex items-center justify-center p-8'>
					{restaurant?.logo ? (
						<img
							src={restaurant.logo}
							alt={restaurant.name}
							className='max-w-full max-h-full object-contain'
						/>
					) : (
						<div className='text-center'>
							<div className='inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-full mb-4'>
								<LogIn className='w-12 h-12 text-white' />
							</div>
							<h2 className='text-2xl font-bold text-gray-800'>{restaurant?.name || 'Restoran'}</h2>
						</div>
					)}
				</div>

				<div className='w-2/5 p-8 flex flex-col justify-center'>
					<button
						onClick={handleBackToRestaurant}
						className='flex items-center text-gray-600 hover:text-gray-800 mb-6'
					>
						<ArrowLeft className='w-5 h-5 mr-2' />
						Geri
					</button>

					<div className='text-center mb-8'>
						<h1 className='text-2xl font-bold text-gray-800 mb-2'>PIN Kod</h1>
						<p className='text-gray-600 text-sm'>4-6 rəqəmli PIN kodunuzu daxil edin</p>
					</div>

					<div className='flex justify-center mb-6'>
						<div className='flex space-x-2'>
							{[...Array(6)].map((_, i) => (
								<div
									key={i}
									className={`w-3 h-3 rounded-full border-2 ${
										i < pinCode.length
											? 'bg-blue-600 border-blue-600'
											: 'bg-white border-gray-300'
									}`}
								/>
							))}
						</div>
					</div>

					{lockoutUntil && (
						<div className='text-center mb-4'>
							<p className='text-red-600 font-semibold'>Gözləyin: {getRemainingTime()}</p>
						</div>
					)}

					{!lockoutUntil && attempts > 0 && (
						<div className='text-center mb-4'>
							<p className='text-orange-600 text-sm'>{3 - attempts} cəhd qaldı</p>
						</div>
					)}

					<NumericKeypad
						value={pinCode}
						onChange={setPinCode}
						onSubmit={handlePinSubmit}
						onBackspace={() => setPinCode(pinCode.slice(0, -1))}
					/>
				</div>
			</div>
		</div>
	);
}
