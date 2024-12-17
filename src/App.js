import React, { useEffect, useState, useCallback } from "react";
import { fetchData } from "./apiService";
import searchResponse from "../src/search-response.json";
import "./index.css"; // Tailwind CSS

function App() {
	const [data, setData] = useState([]);
	const [scrollToken, setScrollToken] = useState(null);
	const [filters, setFilters] = useState({
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

				// Use the hardcoded data instead of making an API call
				const responseData = searchResponse.data.data;
				const newScrollToken = searchResponse.data.scroll_token;

				// Transform the data
				const transformedData = responseData.map((person) => ({
					name: `${person.first_name} ${person.last_name}`,
					jobTitle: person.job_title,
					companyWebsite: person.job_company_website,
					company: person.job_company_name,
					email: person.work_email,
					phone: person.phone_numbers,
					location_country: person.location_country
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

	// Handle input changes with debouncing
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const handleJobLevelsChange = (e) => {
		const { value } = e.target;
		setFilters((prev) => ({ ...prev, job_title_levels: value.split(",") }));
	};

	const loadMore = () => {
		if (scrollToken) getData(true);
	};

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar Filters */}
			<aside className="w-1/4 p-4 bg-white border-r">
				<h2 className="text-lg font-semibold mb-4">Filters</h2>
				<form className="space-y-6">
					<div>
						<label className="block font-semibold">Company Website</label>
						<input
							type="text"
							name="job_company_website"
							className="w-full p-2 border rounded"
							placeholder="e.g., plaid.com"
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<label className="block font-semibold">Job Title Role</label>
						<input
							type="text"
							name="job_title_role"
							className="w-full p-2 border rounded"
							placeholder="e.g., engineering"
							onChange={handleInputChange}
						/>
					</div>
					<div>
						<label className="block font-semibold">Job Title Levels</label>
						<input
							type="text"
							name="job_title_levels"
							className="w-full p-2 border rounded"
							placeholder="vp, director, manager"
							onChange={handleJobLevelsChange}
						/>
					</div>
					<div>
						<label className="block font-semibold">Location Country</label>
						<input
							type="text"
							name="location_country"
							className="w-full p-2 border rounded"
							placeholder="e.g., united states"
							onChange={handleInputChange}
						/>
					</div>
				</form>
			</aside>

			{/* Job Table */}
			<main className="w-3/4 p-6 overflow-auto">
				{error && <div className="text-red-500 mb-4">{error}</div>}
				<table className="table-auto w-full text-sm text-gray-700">
					<thead>
						<tr className="bg-gray-200">
							<th className="py-2 px-4 text-left">Name</th>
							<th className="py-2 px-4 text-left">Job Title</th>
							<th className="py-2 px-4 text-left">Company Website</th>
							<th className="py-2 px-4 text-left">Company</th>
							<th className="py-2 px-4 text-left">Email</th>
							<th className="py-2 px-4 text-left">Phone</th>
							<th className="py-2 px-4 text-left">Location</th>
						</tr>
					</thead>
					<tbody>
						{data.length > 0 ? (
							data.map((item, index) => (
								<tr key={index} className="border-b hover:bg-gray-100">
									<td className="py-2 px-4">{item.name}</td>
									<td className="py-2 px-4">{item.jobTitle}</td>
									<td className="py-2 px-4">
										<a
											href={`https://${item.companyWebsite}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline"
										>
											{item.companyWebsite}
										</a>
									</td>
									<td className="py-2 px-4">{item.company}</td>
									<td className="py-2 px-4">{item.email}</td>
									<td className="py-2 px-4">{item.phone}</td>
									<td className="py-2 px-4">{item.location_country}</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="7" className="text-center p-4">
									{loading ? "Loading data..." : "No data available."}
								</td>
							</tr>
						)}
					</tbody>
				</table>

				{/* Load More Button */}
				{scrollToken && (
					<div className="flex justify-center mt-4">
						<button
							onClick={loadMore}
							disabled={loading}
							className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
						>
							{loading ? "Loading..." : "Load More"}
						</button>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
