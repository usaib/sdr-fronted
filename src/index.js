import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Outreach from './Outreach';
import reportWebVitals from './reportWebVitals';
import CampaignRecommendation from './CampaignRecommendation';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/finding-people" element={<App />} />
				<Route path="/outreach-strategy" element={<Outreach />} />
				<Route path="/" element={<CampaignRecommendation />} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();