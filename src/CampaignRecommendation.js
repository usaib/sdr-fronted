import React, { useState } from "react";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";

function CampaignRecommendation() {
	const [formData, setFormData] = useState({
		website: "",
		knowledgeBase: null,
		companyName: "",
		campaignPurpose: "",
		industry: "",
		technology: ""
	});
	const [knowledgeBaseKey, setKnowledgeBaseKey] = useState("");
	const [uploading, setUploading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file && file.type === "application/pdf") {
			setUploading(true);

			try {
				// Configure AWS SDK
				AWS.config.update({
				
					region: "us-east-1" // Update to your region
				});

				const s3 = new AWS.S3();
				const params = {
					Bucket: "user-files-uploaded",
					Key: `sdr_temp_files/${file.name}`, // Use a specific folder or prefix if needed
					Body: file,
					ContentType: "application/pdf"
				};

				s3.upload(params, (err, data) => {
					setUploading(false);
					if (err) {
						console.error("Error uploading file:", err);
						alert("Error uploading file. Please try again.");
					} else {
						console.log("File uploaded successfully:", data.Key);
						setKnowledgeBaseKey(data.Key);
						alert("File uploaded successfully!");
					}
				});
			} catch (error) {
				setUploading(false);
				console.error("Error during file upload:", error);
				alert("Error during file upload. Please try again.");
			}
		} else {
			alert("Please upload a PDF file.");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!knowledgeBaseKey) {
			alert("Please upload a PDF file.");
			return;
		}

		const payload = {
			website: formData.website,
			knowledge_base: knowledgeBaseKey, // Pass the S3 key instead of the location
			company_name: formData.companyName,
			campaign_purpose: formData.campaignPurpose,
			industry: formData.industry,
			technology: formData.technology
		};

		try {
			setLoadingMessage("Calling recommendation engine...");
			setTimeout(() => {
				setLoadingMessage("Getting your website info...");
			}, 4000);
			const response = await fetch(
				"http://127.0.0.1:5000/api/recommend-contacts",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(payload)
				}
			);

			const data = await response.json();
			setTimeout(() => {
				setLoadingMessage("Reading your knowledge base...");
			}, 500);
			// Simulate delay for demonstration
			setTimeout(() => {
				setLoadingMessage("Finding the right people for you...");
			}, 500);
			if (data.success) {
				console.log("Recommendations:", data.recommendations);
				setTimeout(() => {
					navigate("/finding-people", {
						state: {
							recommendations: data.recommendations,
							targeting_parameters: data.targeting_parameters
						}
					});
				}, 1000);
			} else {
				console.error("Error:", data.error);
				setLoadingMessage("");
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
		<div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">
				Campaign Recommendation
			</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Website
					</label>
					<input
						type="text"
						name="website"
						value={formData.website}
						onChange={handleChange}
						className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., www.atlasnova.ai"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Internal Knowledge Base
					</label>
					<input
						type="file"
						name="knowledgeBase"
						onChange={handleFileChange}
						className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
					{uploading && (
						<div className="mt-2 text-blue-600">Uploading file to S3...</div>
					)}
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Company Name
					</label>
					<input
						type="text"
						name="companyName"
						value={formData.companyName}
						onChange={handleChange}
						className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="e.g., AtlasNova.ai"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Purpose of Campaign
					</label>
					<textarea
						name="campaignPurpose"
						value={formData.campaignPurpose}
						onChange={handleChange}
						className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						placeholder="Describe the purpose of your campaign"
						rows="3"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Industry
					</label>
					<select
						name="industry"
						value={formData.industry}
						onChange={handleChange}
						className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Select Industry</option>
						<option value="Technology">Technology</option>
						<option value="Healthcare">Healthcare</option>
						<option value="Finance">Finance</option>
						<option value="Education">Education</option>
						{/* Add more options as needed */}
					</select>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Technology
					</label>
					<select
						name="technology"
						value={formData.technology}
						onChange={handleChange}
						className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Select Technology</option>
						<option value="AI">AI</option>
						<option value="Cloud Computing">Cloud Computing</option>
						<option value="Blockchain">Blockchain</option>
						<option value="IoT">IoT</option>
						{/* Add more options as needed */}
					</select>
				</div>
				<div className="flex justify-between">
					<button
						type="submit"
						className="px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
					>
						Get Recommendations
					</button>
					<button
						type="button"
						onClick={handleSkip}
						className="px-4 py-2.5 bg-gray-600 text-white font-medium text-sm rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition-colors"
					>
						Skip
					</button>
				</div>
				{loadingMessage && (
					<div className="mt-4 text-blue-600">{loadingMessage}</div>
				)}
			</form>
		</div>
	);
}

export default CampaignRecommendation;
