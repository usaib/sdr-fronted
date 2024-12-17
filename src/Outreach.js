import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

function Outreach() {
	const location = useLocation();
	const selectedData = location.state?.selectedData || [];
	const [selectedPerson, setSelectedPerson] = useState(null);
	const [generatedEmails, setGeneratedEmails] = useState("Hey Everyone!");
	const [loading, setLoading] = useState(false);
	// Form state
	const [senderData, setSenderData] = useState({
		name: "",
		company_name: ""
	});

	const [emailPreferences, setEmailPreferences] = useState({
		tone: "professional",
		language: "american_english",
		purpose: "Sales Outreach for AI Company" // You can make this dynamic if needed
	});

	// Handle sender form changes
	const handleSenderInputChange = (e) => {
		const { name, value } = e.target;
		setSenderData((prev) => ({
			...prev,
			[name]: value
		}));
	};

	// Handle email preferences changes
	const handlePreferenceChange = (e) => {
		const { name, value } = e.target;
		setEmailPreferences((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const generateAllEmails = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/generate-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					person_data: selectedData,
					sender_data: senderData,
					purpose: emailPreferences.purpose,
					tone: emailPreferences.tone,
					language: emailPreferences.language
				})
			});

			const data = await response.json();
			if (data.success) {
				setGeneratedEmails(data.emails);
			} else {
				alert(data.error || "Failed to generate emails");
			}
		} catch (error) {
			alert("Error generating emails");
		} finally {
			setLoading(false);
		}
	};
	// Handle email edit
	const handleEmailEdit = (index, field, value) => {
		setGeneratedEmails((prev) => {
			const newEmails = [...prev];
			newEmails[index] = {
				...newEmails[index],
				[field]: value
			};
			return newEmails;
		});
	};

	// Handle email send
	const handleSendEmail = async (email) => {
		// Implement your email sending logic here
		console.log("Sending email:", email);
	};
	return (
		<div className="p-8">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">Selected Items</h1>
				<Link
					to="/"
					className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
				>
					Back to List
				</Link>
			</div>
			{/* Sender Information Form */}
			<div className="mb-8 bg-white p-6 rounded-lg shadow">
				<h2 className="text-lg font-semibold mb-4">Sender Information</h2>
				<div className="grid grid-cols-3 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Your Name
						</label>
						<input
							type="text"
							name="name"
							value={senderData.name}
							onChange={handleSenderInputChange}
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Company Name
						</label>
						<input
							type="text"
							name="company_name"
							value={senderData.company_name}
							onChange={handleSenderInputChange}
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Purpose of Campaign
						</label>
						<input
							type="text"
							name="purpose"
							value={emailPreferences.purpose}
							onChange={handlePreferenceChange}
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>

				{/* Email Preferences */}
				<div className="grid grid-cols-2 gap-6 mt-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Tone
						</label>
						<select
							name="tone"
							value={emailPreferences.tone}
							onChange={handlePreferenceChange}
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						>
							<option value="professional">Professional</option>
							<option value="friendly">Friendly</option>
							<option value="direct">Direct</option>
							<option value="empathetic">Empathetic</option>
							<option value="formal">Formal</option>
							<option value="analytical">Analytical</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Language
						</label>
						<select
							name="language"
							value={emailPreferences.language}
							onChange={handlePreferenceChange}
							className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
						>
							<option value="american_english">American English</option>
							<option value="british_english">British English</option>
							<option value="chinese">Chinese</option>
							<option value="spanish">Spanish</option>
							{/* Add more languages as needed */}
						</select>
					</div>
				</div>
				<button
					onClick={generateAllEmails}
					disabled={loading}
					className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? "Generating Emails..." : "Generate Emails for All"}
				</button>
			</div>
			{/* Selected Contacts Table */}

			<div className="bg-white rounded-lg shadow overflow-hidden mb-6">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead>
							<tr className="bg-gray-50">
								<th
									scope="col"
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Status
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
							{selectedData.map((item, index) => {
								const generatedEmail = generatedEmails[index];
								return (
									<tr
										key={index}
										onClick={() => setSelectedPerson(index)}
										className={`hover:bg-gray-50 cursor-pointer transition-colors ${
											selectedPerson === index ? "bg-blue-50" : ""
										}`}
									>
										<td className="px-6 py-4 whitespace-nowrap">
											{generatedEmail ? (
												<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
													Generated
												</span>
											) : (
												<span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
													Pending
												</span>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{item.name}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{item.jobTitle}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{item.jobTitleLevels}
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
												Profile
											</a>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{item.locationCountry}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
			{/* Email Editor */}
			{selectedPerson !== null && generatedEmails[selectedPerson] && (
				<div className="bg-white p-6 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-4">Edit Email</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Subject
							</label>
							<input
								type="text"
								value={generatedEmails[selectedPerson].subject}
								onChange={(e) =>
									handleEmailEdit(selectedPerson, "subject", e.target.value)
								}
								className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Body
							</label>
							<textarea
								value={generatedEmails[selectedPerson].body}
								onChange={(e) =>
									handleEmailEdit(selectedPerson, "body", e.target.value)
								}
								rows={10}
								className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div className="flex justify-end space-x-4">
							<button
								onClick={() =>
									navigator.clipboard.writeText(
										generatedEmails[selectedPerson].body
									)
								}
								className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
							>
								Copy to Clipboard
							</button>
							<button
								onClick={() => handleSendEmail(generatedEmails[selectedPerson])}
								className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
							>
								Send Email
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Outreach;
