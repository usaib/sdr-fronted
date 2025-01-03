import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Outreach from './Outreach';
import reportWebVitals from './reportWebVitals';
import CampaignRecommendation from './CampaignRecommendation';
import Home from './pages/Home';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/finding-people" element={<App />} />
				<Route path="/outreach-strategy" element={<Outreach />} />
				<Route
					path="/campaign-recommendation"
					element={<CampaignRecommendation />}
				/>
				<Route path="/advertise-manager" element={<CampaignRecommendation />} />
				<Route path="/" element={<Home />} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();