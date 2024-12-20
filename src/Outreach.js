import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

function Outreach() {
	const location = useLocation();
	const selectedData = location.state?.selectedData || [];
	const [selectedPerson, setSelectedPerson] = useState(null);
	const [generatedEmails, setGeneratedEmails] = useState("");
	const [sendingStatus, setSendingStatus] = useState({});
	const [sendingErrors, setSendingErrors] = useState({});

	const [loading, setLoading] = useState(false);
	// Form state
	const [senderData, setSenderData] = useState({
		name: "",
		company_name: ""
	});
	const [formErrors, setFormErrors] = useState({
		purpose: false,
		name: false,
		company_name: false
	});

	const [emailPreferences, setEmailPreferences] = useState({
		tone: "professional",
		language: "american_english",
		purpose: "Sales Outreach for AI Company" // You can make this dynamic if needed
	});
	const isFormComplete =
		emailPreferences.purpose && senderData.name && senderData.company_name;

	// Updated input change handlers with validation
	const handleSenderInputChange = (e) => {
		const { name, value } = e.target;
		setSenderData((prev) => ({
			...prev,
			[name]: value
		}));
		// Clear error when user types
		setFormErrors((prev) => ({
			...prev,
			[name]: false
		}));
	};

	const handlePreferenceChange = (e) => {
		const { name, value } = e.target;
		setEmailPreferences((prev) => ({
			...prev,
			[name]: value
		}));
		// Clear error when user types
		setFormErrors((prev) => ({
			...prev,
			[name]: false
		}));
	};

	const generateAllEmails = async () => {
		const newErrors = {
			purpose: !emailPreferences.purpose,
			name: !senderData.name,
			company_name: !senderData.company_name
		};

		setFormErrors(newErrors);

		// If any errors, don't proceed
		if (Object.values(newErrors).some((error) => error)) {
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("http://127.0.0.1:5000/api/generate-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				},
				body: JSON.stringify({
					person_data: selectedData,
					sender_data: senderData,
					purpose: emailPreferences.purpose,
					tone: emailPreferences.tone,
					language: emailPreferences.language
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log(data);
			if (data.success) {
				setGeneratedEmails(data.emails);
			} else {
				alert(data.error || "Failed to generate emails");
			}
		} catch (error) {
			console.error("Error generating emails:", error);
			alert("Error generating emails. Please check the console for details.");
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

	const handleSendEmail = async (email, recipientEmail) => {
		if (!email || !recipientEmail) return;

		setSendingErrors((prev) => ({
			...prev,
			[recipientEmail]: null
		}));

		setSendingStatus((prev) => ({
			...prev,
			[recipientEmail]: "sending"
		}));

		try {
			const response = await fetch("http://127.0.0.1:5000/api/send-email", {
				method: "POST",
				credentials: "include", // Important for session cookies
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					to: "it_account@atlasnova.ai",
					subject: email.subject,
					body: email.body,
					user_email: "usaibkhan777@gmail.com"
				})
			});

			const data = await response.json();

			if (data.success) {
				setSendingStatus((prev) => ({
					...prev,
					[recipientEmail]: "sent"
				}));
			} else {
				throw new Error(data.error);
			}
		} catch (error) {
			console.error("Failed to send email:", error);
			setSendingStatus((prev) => ({
				...prev,
				[recipientEmail]: "error"
			}));
			setSendingErrors((prev) => ({
				...prev,
				[recipientEmail]: error.message
			}));
		}
	};

	return (
		<div className="h-screen flex flex-col bg-gray-50">
			{/* Header */}
			<div className="p-4 border-b bg-white">
				<div className="max-w-7xl mx-auto flex items-center justify-between">
					<h1 className="text-2xl font-bold text-gray-900">Email Outreach</h1>
					<Link
						to="/"
						className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
					>
						Back to List
					</Link>
				</div>
			</div>
			{/* Campaign Settings Panel */}
			<div className="bg-white border-b">
				<div className="ml-5">
					<div className="grid grid-cols-1 gap-6 p-4">
						<div>
							<label className="block text-xl font-semibold text-gray-900 mb-2">
								Purpose of Campaign <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								name="purpose"
								value={emailPreferences.purpose}
								onChange={handlePreferenceChange}
								className={`w-full p-3 border ${
									formErrors.purpose ? "border-red-500" : "border-gray-300"
								} rounded-lg focus:ring-2 focus:ring-blue-500 text-lg`}
								placeholder="e.g., Sales Outreach for AI Company"
							/>
							{formErrors.purpose && (
								<p className="mt-1 text-sm text-red-500">
									Please enter the purpose of the campaign
								</p>
							)}
						</div>

						<div className="grid grid-cols-5 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Your Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="name"
									value={senderData.name}
									onChange={handleSenderInputChange}
									className={`w-full p-2 border ${
										formErrors.name ? "border-red-500" : "border-gray-300"
									} rounded-lg focus:ring-2 focus:ring-blue-500`}
									placeholder="John Doe"
								/>
								{formErrors.name && (
									<p className="mt-1 text-sm text-red-500">
										Please enter your name
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Company Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="company_name"
									value={senderData.company_name}
									onChange={handleSenderInputChange}
									className={`w-full p-2 border ${
										formErrors.company_name
											? "border-red-500"
											: "border-gray-300"
									} rounded-lg focus:ring-2 focus:ring-blue-500`}
									placeholder="Acme Inc"
								/>
								{formErrors.company_name && (
									<p className="mt-1 text-sm text-red-500">
										Please enter your company name
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Tone
								</label>
								<select
									name="tone"
									value={emailPreferences.tone}
									onChange={handlePreferenceChange}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Language
								</label>
								<select
									name="language"
									value={emailPreferences.language}
									onChange={handlePreferenceChange}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="american_english">American English</option>
									<option value="british_english">British English</option>
									<option value="chinese">Chinese</option>
									<option value="spanish">Spanish</option>
								</select>
							</div>
							{/* Generate Button */}
							<div className="mt-4">
								<button
									onClick={generateAllEmails}
									disabled={loading || !isFormComplete}
									className={`w-full p-3 rounded-lg font-medium transition-colors ${
										isFormComplete
											? "bg-blue-600 hover:bg-blue-700 text-white"
											: "bg-gray-300 text-gray-500 cursor-not-allowed"
									}`}
								>
									{loading ? "Generating..." : "Generate All Emails"}
								</button>
								{!isFormComplete && (
									<p className="mt-2 text-sm text-gray-500 text-center">
										Please fill in all required fields marked with *
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Area */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left Panel - Contact List */}
				<div className="w-1/2 overflow-y-auto border-r border-gray-200">
					<div className="bg-white shadow-sm">
						{selectedData.map((item, index) => {
							const generatedEmail = generatedEmails[index];
							return (
								<div
									key={index}
									onClick={() => setSelectedPerson(index)}
									className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
										selectedPerson === index ? "bg-blue-50" : ""
									}`}
								>
									<div className="flex items-center justify-between mb-2">
										<span className="font-medium text-gray-900 text-lg">
											{item.name}
										</span>

										{generatedEmail ? (
											<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
												Generated
											</span>
										) : (
											<span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
												Pending
											</span>
										)}
									</div>
									<div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										{item.jobTitle}
									</div>
									<div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-blue-800">
										{item.jobTitleLevels}
									</div>
									<div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										{item.email}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Right Panel - Email Editor */}
				<div className="w-1/2 overflow-y-auto bg-gray-50">
					{selectedPerson !== null && generatedEmails[selectedPerson] ? (
						<div className="p-6">
							<h2 className="text-lg font-semibold mb-4">Edit Email</h2>
							<div className="space-y-4">
								{sendingErrors[selectedData[selectedPerson].email] && (
									<div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
										{sendingErrors[selectedData[selectedPerson].email]}
									</div>
								)}

								{/* Success Message */}
								{sendingStatus[selectedData[selectedPerson].email] ===
									"sent" && (
									<div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
										Email sent successfully!
									</div>
								)}
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
										rows={15}
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
										onClick={() =>
											handleSendEmail(
												generatedEmails[selectedPerson],
												selectedData[selectedPerson].email
											)
										}
										className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
									>
										Send Email
									</button>
								</div>
							</div>
						</div>
					) : (
						<div className="h-full flex items-center justify-center text-gray-500">
							Select a contact to view or edit their email
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Outreach;
