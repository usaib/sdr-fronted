import React, { useState } from "react";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";

function CampaignRecommendation() {
	const [formData, setFormData] = useState({
		website: "",
		knowledgeBase: null,
		companyName: "",
		industry: "",
		knowsICP: "",
		icpIndustry: "",
		companySize: "",
		jobTitles: [],
		icpDescription: ""
	});
	const [knowledgeBaseKey, setKnowledgeBaseKey] = useState("");
	const [uploading, setUploading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");
	const navigate = useNavigate();

	const industries = [
		"Technology",
		"SaaS",
		"E-commerce",
		"Healthcare",
		"Fintech",
		"Manufacturing",
		"Education",
		"Marketing",
		"Artificial Intelligence",
		"Cybersecurity",
		"Blockchain",
		"IoT",
		"Logistics",
		"Retail",
		"Telecommunications"
	];

	const companySizes = [
		"1-10 employees",
		"11-50 employees",
		"51-200 employees",
		"201-500 employees",
		"501-1000 employees",
		"1000+ employees"
	];

	const jobTitles = [
		"CEO",
		"CTO",
		"CFO",
		"CMO",
		"VP of Sales",
		"Director of Engineering",
		"IT Manager",
		"Marketing Director",
		"Operations Manager",
		"Product Manager"
	];

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleMultiSelect = (e) => {
		const options = e.target.options;
		const selected = [];
		for (let i = 0; i < options.length; i++) {
			if (options[i].selected) selected.push(options[i].value);
		}
		setFormData((prev) => ({ ...prev, [e.target.name]: selected }));
	};

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.type !== "application/pdf") {
				alert("Please upload a PDF file.");
				return;
			}

			setUploading(true);
			try {
				AWS.config.update({
					accessKeyId: "AKIA5FTZFHPXIDAXYUF3",
					secretAccessKey: "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",
					region: "us-east-1"
				});

				const s3 = new AWS.S3();
				const params = {
					Bucket: "user-files-uploaded",
					Key: `sdr_temp_files/${file.name}`,
					Body: file,
					ContentType: "application/pdf"
				};

				s3.upload(params, (err, data) => {
					setUploading(false);
					if (err) {
						console.error("Error uploading file:", err);
						alert("Error uploading file. Please try again.");
					} else {
						setKnowledgeBaseKey(data.Key);
					}
				});
			} catch (error) {
				setUploading(false);
				console.error("Error during file upload:", error);
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const ICP =
			formData.knowsICP === "yes"
				? `Industry: ${formData.icpIndustry}, Company Size: ${
						formData.companySize
				  }, Target Roles: ${formData.jobTitles.join(", ")}`
				: formData.icpDescription;

		const payload = {
			website: formData.website,
			knowledge_base: knowledgeBaseKey || "",
			company_name: formData.companyName,
			ideal_customer_profile: ICP,
			industry: formData.industry
		};

		try {
			setLoadingMessage("Analyzing your inputs...");
			const response = await fetch(
				"http://sdrlb-1393110018.us-east-1.elb.amazonaws.com/api/recommend-contacts",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload)
				}
			);

			const data = await response.json();
			if (data.success) {
				navigate("/finding-people", {
					state: {
						recommendations: data.recommendations,
						targeting_parameters: data.targeting_parameters
					}
				});
			}
		} catch (error) {
			console.error("Error during recommendation request:", error);
			setLoadingMessage("");
		}
	};

	const handleSkip = () => {
		navigate("/finding-people", {
			state: { recommendations: null, targeting_parameters: null }
		});
	};

	return (
		<div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-2xl mt-10">
			<h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 pb-4">
				Build Your Ideal Customer Profile
			</h2>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Company Information Section */}
				<div className="space-y-4 border-b-2 pb-6">
					<h3 className="text-xl font-semibold text-gray-700 mb-4">
						Your Company Information
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-2">
								Company Website
							</label>
							<input
								type="text"
								name="website"
								value={formData.website}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="https://yourcompany.com"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-600 mb-2">
								Company Name
							</label>
							<input
								type="text"
								name="companyName"
								value={formData.companyName}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Your Company Inc."
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-2">
								Industry
							</label>
							<select
								name="industry"
								value={formData.industry}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">Select Industry</option>
								{industries.map((industry) => (
									<option key={industry} value={industry}>
										{industry}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				{/* Optional Knowledge Base Upload */}
				<div className="space-y-4 border-b-2 pb-6">
					<h3 className="text-xl font-semibold text-gray-700 mb-4">
						Company Knowledge Base (Optional)
						<span className="text-sm text-gray-500 ml-2 font-normal">
							- Upload internal documents to improve recommendations
						</span>
					</h3>
					<div>
						<div className="flex items-center space-x-4">
							<input
								type="file"
								name="knowledgeBase"
								onChange={handleFileChange}
								className="w-full p-3 border border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
							/>
							{uploading && (
								<div className="text-blue-600 flex items-center">
									<svg
										className="animate-spin h-5 w-5 mr-2"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
											fill="none"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Uploading...
								</div>
							)}
						</div>
					</div>
				</div>

				{/* ICP Section */}
				<div className="space-y-4">
					<h3 className="text-xl font-semibold text-gray-700 mb-4">
						Ideal Customer Profile
					</h3>

					<div className="grid grid-cols-1 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-2">
								Do you know your ideal customers?
							</label>
							<select
								name="knowsICP"
								value={formData.knowsICP}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">Select an option</option>
								<option value="yes">Yes, I know my ICP</option>
								<option value="no">No, help me identify them</option>
							</select>
						</div>

						{formData.knowsICP === "yes" && (
							<div className="space-y-4 bg-gray-50 p-4 rounded-lg">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-600 mb-2">
											Target Industry
										</label>
										<select
											name="icpIndustry"
											value={formData.icpIndustry}
											onChange={handleChange}
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="">Select Industry</option>
											{industries.map((industry) => (
												<option key={industry} value={industry}>
													{industry}
												</option>
											))}
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-600 mb-2">
											Company Size
										</label>
										<select
											name="companySize"
											value={formData.companySize}
											onChange={handleChange}
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="">Select Company Size</option>
											{companySizes.map((size) => (
												<option key={size} value={size}>
													{size}
												</option>
											))}
										</select>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-600 mb-2">
										Target Job Titles
									</label>
									<select
										name="jobTitles"
										multiple
										value={formData.jobTitles}
										onChange={handleMultiSelect}
										className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
									>
										{jobTitles.map((title) => (
											<option key={title} value={title}>
												{title}
											</option>
										))}
									</select>
									<p className="text-sm text-gray-500 mt-1">
										Hold Ctrl/Cmd to select multiple
									</p>
								</div>
							</div>
						)}

						{formData.knowsICP === "no" && (
							<div>
								<label className="block text-sm font-medium text-gray-600 mb-2">
									Describe your ideal customers
								</label>
								<textarea
									name="icpDescription"
									value={formData.icpDescription}
									onChange={handleChange}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Example: Tech startups in SaaS space with 50-200 employees, looking for marketing automation solutions"
									rows="4"
								/>
							</div>
						)}
					</div>
				</div>

				{/* Form Actions */}
				<div className="flex flex-col md:flex-row justify-between gap-4 pt-6">
					<button
						type="submit"
						className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all flex items-center justify-center"
					>
						{loadingMessage ? (
							<>
								<svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
										fill="none"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								{loadingMessage}
							</>
						) : (
							"Generate Recommendations"
						)}
					</button>
					<button
						type="button"
						onClick={handleSkip}
						className="flex-1 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition-all"
					>
						Skip to Manual Search
					</button>
				</div>
			</form>
		</div>
	);
}

export default CampaignRecommendation;
