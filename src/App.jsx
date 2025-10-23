import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import POSLoginPage from './pages/POSLoginPage';
import POSDashboard from './pages/POSDashboard';
import CustomerDisplay from './pages/CustomerDisplay';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
	return (
		<Provider store={store}>
			<Router>
				<Routes>
					<Route path='/' element={<Navigate to='/pos/login' replace />} />
					<Route path='/pos/login' element={<POSLoginPage />} />
					<Route
						path='/pos/dashboard'
						element={
							<ProtectedRoute>
								<POSDashboard />
							</ProtectedRoute>
						}
					/>
					<Route path='/customer-display' element={<CustomerDisplay />} />
				</Routes>
			</Router>
			<Toaster position='top-right' />
		</Provider>
	);
}

export default App;
