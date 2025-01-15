import React, { useState } from "react";
import AWS from "aws-sdk";
import { useNavigate } from "react-router-dom";
import LoadingSteps from "./LoadingSteps";
const targetAudienceOptions = {
	Restaurant: [
		{ value: "Fine_Dining", label: "Fine Dining Enthusiasts" },
		{ value: "Families", label: "Families with Children" },
		{ value: "Young_Professionals", label: "Young Professionals" },
		{ value: "Students", label: "College Students" },
		{ value: "Business_Customers", label: "Business Lunch Customers" },
		{ value: "Health_Conscious", label: "Health-Conscious Diners" },
		{ value: "Tourists", label: "Tourists/Travelers" },
		{ value: "Late_Night", label: "Late Night Diners" },
		{ value: "Delivery_Focused", label: "Delivery/Takeout Customers" },
		{ value: "Vegetarian_Vegan", label: "Vegetarian/Vegan Customers" },
		{ value: "Senior_Citizens", label: "Senior Citizens" },
		{ value: "Local_Regulars", label: "Local Regular Customers" },
		{ value: "Special_Occasions", label: "Special Occasion Diners" },
		{ value: "Catering_Clients", label: "Catering/Event Clients" }
	],
	Startup: [
		{ value: "SMB", label: "Small and Medium Businesses (SMB)" },
		{ value: "Enterprise", label: "Enterprise Companies" },
		{ value: "Tech_Startups", label: "Tech Startups" },
		{ value: "Investors", label: "Investors and VCs" },
		{ value: "Entrepreneurs", label: "Entrepreneurs" },
		{ value: "Developer_Community", label: "Developer Community" },
		{ value: "Business_Decision_Makers", label: "Business Decision Makers" },
		{ value: "Innovation_Teams", label: "Innovation Teams" },
		{ value: "Accelerators", label: "Accelerators and Incubators" },
		{ value: "Industry_Experts", label: "Industry Experts" },
		{ value: "Early_Adopters", label: "Early Adopters" },
		{ value: "Corporate_Partners", label: "Corporate Partners" }
	]
};
function AdvertiseInputs() {
	const [formData, setFormData] = useState({
		website: "",
		knowledgeBase: null,
		companyName: "",
		advertisementPurpose: "",
		industry: "",
		target_audience: ""
	});
	const [knowledgeBaseKey, setKnowledgeBaseKey] = useState("");
	const [uploading, setUploading] = useState(false);
	const [loadingMessage, setLoadingMessage] = useState("");
	const [selectedContentTypes, setSelectedContentTypes] = useState([]);
	const [selectedPlatforms, setSelectedPlatforms] = useState([]);
	const [textContent, setTextContent] = useState("");
	const [currentStep, setCurrentStep] = useState(1);
	const [videoType, setVideoType] = useState("");
	const [videoFile, setVideoFile] = useState(null);
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [selectedTargetAudiences, setSelectedTargetAudiences] = useState([]);

	const handleContentTypeChange = (e) => {
		const { value, checked } = e.target;
		setSelectedContentTypes((prev) =>
			checked ? [...prev, value] : prev.filter((type) => type !== value)
		);
	};

	const handlePlatformChange = (e) => {
		const { value, checked } = e.target;
		setSelectedPlatforms((prev) =>
			checked ? [...prev, value] : prev.filter((platform) => platform !== value)
		);
	};
 const handleChange = (e) => {
		const { name, value } = e.target;
		if (name === "industry") {
			setSelectedTargetAudiences([]); // Reset selected audiences when industry changes
		}
		setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleTargetAudienceChange = (e) => {
		const value = e.target.value;
		setSelectedTargetAudiences((prev) => {
			if (prev.includes(value)) {
				return prev.filter((item) => item !== value);
			} else {
				return [...prev, value];
			}
		});
 };
	

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file && file.type === "application/pdf") {
			setUploading(true);

			try {
				// Configure AWS SDK
				AWS.config.update({
					accessKeyId: "AKIA5FTZFHPXIDAXYUF3",
					secretAccessKey: "HOSuzwUA9cc7rdmz1088lqIvhnZZxcxVC4fQ1VHV",
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
	const handleVideoFileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			setUploading(true);

			try {
				const s3 = new AWS.S3();
				const params = {
					Bucket: "user-files-uploaded",
					Key: `advertise_temp_files/${file.name}`, // Use a specific folder or prefix if needed
					Body: file,
					ContentType: file.type
				};

				s3.upload(params, (err, data) => {
					setUploading(false);
					if (err) {
						console.error("Error uploading image:", err);
						alert("Error uploading image. Please try again.");
					} else {
						console.log("Image uploaded successfully:", data.Key);
						setVideoFile(data.Key); // Store the S3 key of the uploaded image
						alert("Image uploaded successfully!");
					}
				});
			} catch (error) {
				setUploading(false);
				console.error("Error during image upload:", error);
				alert("Error during image upload. Please try again.");
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!knowledgeBaseKey) {
			alert("Please upload a PDF file.");
			return;
		}

		setIsLoading(true);
		setCurrentLoadingStep(0);

		const payload = {
			website: formData.website,
			knowledge_base: knowledgeBaseKey,
			company_name: formData.companyName,
			advertisement_purpose: formData.advertisementPurpose,
			industry: formData.industry,
			target_audience: selectedTargetAudiences.join(", "), // Convert array to comma-separated string
			content_types: selectedContentTypes,
			platforms: selectedPlatforms,
			video_image_key: videoFile,
			text_content_for_video: textContent,
			user_id: "bd55caaf-bf64-4093-a041-66022e9160c3"
		};

		try {
			// Step 1: Website Information
			setCurrentLoadingStep(0);
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Step 2: Knowledge Base
			setCurrentLoadingStep(1);
			await new Promise((resolve) => setTimeout(resolve, 2500));

			// Step 3-6: Creating posts for different platforms
			for (let platform of selectedPlatforms) {
				setCurrentLoadingStep(2 + selectedPlatforms.indexOf(platform));
				await new Promise((resolve) => setTimeout(resolve, 1800));
			}
			const response = await fetch(
				"http://sdrlb-1393110018.us-east-1.elb.amazonaws.com/api/advertise",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(payload)
				}
			);

			// Step 7: Video Generation
			if (selectedContentTypes.includes("video")) {
				setCurrentLoadingStep(6);
				await new Promise((resolve) => setTimeout(resolve, 3000));
			}

			// Step 8: Image Creation
			if (selectedContentTypes.includes("image")) {
				setCurrentLoadingStep(7);
				await new Promise((resolve) => setTimeout(resolve, 2500));
			}

			const data = await response.json();

			if (data.success) {
				navigate("/advertisement-plan", {
					state: {
						status: data.status,
						task_id: data.task_id
					}
				});
			} else {
				console.error("Error:", data.error);
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Error during recommendation request:", error);
			setIsLoading(false);
		}
	};

	const handleNextStep = () => {
		setCurrentStep((prev) => prev + 1);
	};

	const handlePreviousStep = () => {
		setCurrentStep((prev) => prev - 1);
	};

	const handleVideoTypeChange = (e) => {
		setVideoType(e.target.value);
	};

	return (
		<div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">
				Advertise Planning
			</h2>
			<form onSubmit={handleSubmit} className="space-y-6">
				{currentStep === 1 && (
					<div className="space-y-4">
						{/* Step 1: Basic Information */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Website
							</label>
							<input
								type="text"
								name="website"
								value={formData.website}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g., www.atlasnova.ai"
							/>
						</div>
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Internal Knowledge Base
							</label>
							<input
								type="file"
								name="knowledgeBase"
								onChange={handleFileChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
							{uploading && (
								<div className="mt-2 text-blue-600">
									Uploading file to S3...
								</div>
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
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g., AtlasNova.ai"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Which type of Advertisement you want to do?
							</label>
							<textarea
								name="advertisementPurpose"
								value={formData.advertisementPurpose}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Describe your advertisement plan."
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
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								<option value="">Select Industry</option>
								<option value="Startup">Startup</option>
								<option value="Restaurant">Restaurant</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Target Audience
							</label>
							<div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3">
								{formData.industry &&
									targetAudienceOptions[formData.industry]?.map((option) => (
										<div key={option.value} className="flex items-center mb-2">
											<input
												type="checkbox"
												id={option.value}
												value={option.value}
												checked={selectedTargetAudiences.includes(option.value)}
												onChange={handleTargetAudienceChange}
												className="mr-2"
											/>
											<label
												htmlFor={option.value}
												className="text-sm text-gray-700"
											>
												{option.label}
											</label>
										</div>
									))}
								{!formData.industry && (
									<p className="text-gray-500 text-sm">
										Please select an industry first
									</p>
								)}
							</div>
						</div>

						<button
							type="button"
							onClick={handleNextStep}
							className="px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
						>
							Next
						</button>
					</div>
				)}

				{currentStep === 2 && (
					<div className="space-y-4">
						{/* Step 2: Content Type Selection */}
						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Content Type
							</label>
							<div className="flex space-x-4">
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										value="text"
										checked={selectedContentTypes.includes("text")}
										onChange={handleContentTypeChange}
									/>
									<i className="fas fa-font"></i>
									Text
								</label>
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										value="image"
										checked={selectedContentTypes.includes("image")}
										onChange={handleContentTypeChange}
									/>
									<i className="fas fa-image"></i> {/* Add an icon for image */}
									Image
								</label>
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										value="video"
										checked={selectedContentTypes.includes("video")}
										onChange={handleContentTypeChange}
									/>
									<i className="fas fa-video"></i> {/* Add an icon for video */}
									Video
								</label>
							</div>
						</div>
						{selectedContentTypes.includes("video") && (
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Which type of video do you want to generate?
								</label>
								<select
									value={videoType}
									onChange={handleVideoTypeChange}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									<option value="">Select Video Type</option>
									<option value="imageToVideo">Image to Video</option>
									{/* Add more video types if needed */}
								</select>
								{videoType === "imageToVideo" && (
									<div className="mb-4 mt-4">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Upload Image for Video
										</label>
										<input
											type="file"
											onChange={handleVideoFileChange}
											className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										/>
									</div>
								)}
							</div>
						)}

						<div className="mb-4">
							{/* Step 3: Finalize and Submit */}

							<div className="mb-4 mt-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Text Content for Video Generation
								</label>
								<textarea
									name="textContent"
									value={textContent}
									onChange={(e) => setTextContent(e.target.value)}
									className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									placeholder="Describe which type of video you want to generate?"
									rows="3"
								/>
							</div>

							<div className="mb-10 mt-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Social Media Platforms
								</label>
								<div className="flex space-x-4">
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											value="facebook"
											checked={selectedPlatforms.includes("facebook")}
											onChange={handlePlatformChange}
										/>
										<i className="fab fa-facebook text-blue-600"></i>
										<span>Facebook</span>{" "}
									</label>
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											value="instagram"
											checked={selectedPlatforms.includes("instagram")}
											onChange={handlePlatformChange}
										/>
										<i className="fab fa-instagram text-pink-500"></i>
										<span>Instagram</span>{" "}
									</label>
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											value="twitter"
											checked={selectedPlatforms.includes("twitter")}
											onChange={handlePlatformChange}
										/>
										<i className="fab fa-twitter text-blue-400"></i>
										<span>Twitter</span>{" "}
									</label>
									<label className="flex items-center space-x-2">
										<input
											type="checkbox"
											value="linkedin"
											checked={selectedPlatforms.includes("linkedin")}
											onChange={handlePlatformChange}
										/>
										<i className="fab fa-linkedin text-blue-700"></i>
										<span>LinkedIn</span>{" "}
									</label>
								</div>
							</div>
							<div className="flex justify-between">
								<button
									type="button"
									onClick={handlePreviousStep}
									className="px-4 py-2.5 bg-gray-600 text-white font-medium text-sm rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition-colors"
								>
									Back
								</button>
								<button
									type="submit"
									className="px-4 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors flex items-center space-x-2"
								>
									<i className="fas fa-paper-plane"></i>{" "}
									{/* Add an icon here */}
									<span>Go!</span>
								</button>
							</div>
						</div>
					</div>
				)}

				{isLoading && <LoadingSteps currentStep={currentLoadingStep} />}
			</form>
		</div>
	);
}

export default AdvertiseInputs;
