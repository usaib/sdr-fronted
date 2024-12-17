import React, { useEffect, useState, useCallback } from "react";
import { fetchData } from "./apiService";
import searchResponse from "../src/search-response.json";
import "./index.css"; // Tailwind CSS
import { useNavigate } from "react-router-dom";

function App() {
	const [data, setData] = useState([]);
	const [scrollToken, setScrollToken] = useState(null);
	const [selectedRows, setSelectedRows] = useState([]);
	const navigate = useNavigate();
	// Add selection handlers
	const handleSelectAll = (e) => {
		if (e.target.checked) {
			setSelectedRows(data.map((_, index) => index));
		} else {
			setSelectedRows([]);
		}
	};

	const handleSelectRow = (index) => {
		setSelectedRows((prev) => {
			if (prev.includes(index)) {
				return prev.filter((i) => i !== index);
			} else {
				return [...prev, index];
			}
		});
	};

	const handleProceed = () => {
		const selectedData = selectedRows.map((index) => data[index]);
		navigate("/outreach-strategy", { state: { selectedData } });
	};
	const [filters, setFilters] = useState({
		job_company_website: "",
		job_title_role: "",
		job_title_levels: [],
		location_country: ""
	});
	const [formValues, setFormValues] = useState({
		job_company_website: "",
		job_title_role: "",
		job_title_levels: "",
		location_country: ""
	});
	const [size] = useState(10);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch data
	const getData = useCallback(
		async (append = false) => {
			try {
				setLoading(true);
				setError(null);
				console.log(filters);
				// Use the hardcoded data instead of making an API call
				const responseData = searchResponse.data.data;
				const newScrollToken = searchResponse.data.scroll_token;

				// Transform the data
				const transformedData = responseData.map((person) => ({
					name: `${person.first_name} ${person.last_name}`,
					jobTitle: person.job_title,
					companyWebsite: person.job_company_website,
					company: person.job_company_name,
					email: person.work_email.toString(),
					phone: person.mobile_phone.toString(),
					jobTitleLevels: person.job_title_levels,
					locationCountry: person.location_country,
					linkedinUrl: person.linkedin_url,
					skills: person.skills.slice(0,3)
				}));

				setData((prev) =>
					append ? [...prev, ...transformedData] : transformedData
				);
				setScrollToken(newScrollToken);
			} catch (err) {
				setError("Failed to process data.");
			} finally {
				setLoading(false);
			}
		},
		[filters] // removed scrollToken and size since we're using static data
	);

	// Trigger data fetch when filters change
	useEffect(() => {
		setScrollToken(null); // Reset pagination when filters change
		getData(false);
	}, [filters, getData]);

	// Update input change handler
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
	};

	// Add form submit handler
	const handleFilterSubmit = (e) => {
		e.preventDefault();

		// Transform job_title_levels from comma-separated string to array
		const levels = formValues.job_title_levels
			? formValues.job_title_levels.split(",").map((level) => level.trim())
			: [];

		// Update filters with current form values
		setFilters({
			...formValues,
			job_title_levels: levels
		});
	};

	const loadMore = () => {
		if (scrollToken) getData(true);
	};
	return (
		<div className="flex h-screen bg-gray-50">
			{/* Sidebar Filters */}
			<aside className="w-70 p-6 bg-white border-r border-gray-200 shadow-sm">
				<h2 className="text-xl font-bold mb-6 text-gray-800">Filters</h2>
				<form onSubmit={handleFilterSubmit} className="space-y-6">
					{/* ... existing filter inputs with updated styling ... */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Company Website
						</label>
						<input
							type="text"
							name="job_company_website"
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., plaid.com"
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Job Title Role
						</label>
						<input
							type="text"
							name="job_title_role"
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., engineering"
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Job Title Levels
						</label>
						<input
							type="text"
							name="job_title_levels"
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="vp, director, manager"
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Location Country
						</label>
						<input
							type="text"
							name="location_country"
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							placeholder="e.g., united states"
							onChange={handleInputChange}
						/>
					</div>
					{/* Filter Button */}
					<button
						type="submit"
						className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
					>
						Apply Filters
					</button>
				</form>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-8 overflow-auto">
				{error && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
						{error}
					</div>
				)}
				{data.length > 0 && (
					<div className="mb-4 flex justify-between items-center">
						<div className="text-sm text-gray-600">
							{selectedRows.length} items selected
						</div>
						{selectedRows.length > 0 && (
							<button
								onClick={handleProceed}
								className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
							>
								Proceed with Selected
							</button>
						)}
					</div>
				)}
				<div className="bg-white rounded-lg shadow overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead>
								<tr className="bg-gray-50">
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										<input
											type="checkbox"
											checked={
												selectedRows.length === data.length && data.length > 0
											}
											onChange={handleSelectAll}
											className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Name
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Job Title
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Job Title Level
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Skills
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Company Website
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Company
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Email
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Phone
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										LinkedIn
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
									>
										Location
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{data.length > 0 ? (
									data.map((item, index) => (
										<tr
											key={index}
											className={`hover:bg-gray-50 transition-colors ${
												selectedRows.includes(index) ? "bg-blue-50" : ""
											}`}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<input
													type="checkbox"
													checked={selectedRows.includes(index)}
													onChange={() => handleSelectRow(index)}
													className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
												/>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{item.name}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{item.jobTitle}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												<div className="flex flex-wrap gap-1">
													{Array.isArray(item.jobTitleLevels) ? (
														item.jobTitleLevels.map((level, idx) => (
															<span
																key={idx}
																className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
															>
																{level}
															</span>
														))
													) : (
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
															{item.jobTitleLevels}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												<div className="flex flex-wrap gap-1">
													{Array.isArray(item.skills) ? (
														item.skills.map((skill, idx) => (
															<span
																key={idx}
																className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
															>
																{skill}
															</span>
														))
													) : (
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
															{item.skills}
														</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												<a
													href={`https://${item.companyWebsite}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:text-blue-800 hover:underline"
												>
													{item.companyWebsite}
												</a>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{item.company}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{item.email}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{item.phone}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												<a
													href={item.linkedinUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-600 hover:text-blue-800 hover:underline"
												>
													{item.linkedinUrl}
												</a>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{item.locationCountry}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan="8"
											className="px-6 py-4 text-center text-sm text-gray-500"
										>
											{loading ? (
												<div className="flex items-center justify-center">
													<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
													<span className="ml-2">Loading...</span>
												</div>
											) : (
												"No data available."
											)}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Load More Button */}
				{scrollToken && (
					<div className="flex justify-center mt-6">
						<button
							onClick={loadMore}
							disabled={loading}
							className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? (
								<span className="flex items-center">
									<div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white rounded-full"></div>
									Loading...
								</span>
							) : (
								"Load More"
							)}
						</button>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
