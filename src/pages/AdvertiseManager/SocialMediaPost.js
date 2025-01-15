import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";

const SocialMediaPost = ({ content = "asd" }) => {
	const [selectedPlatform, setSelectedPlatform] = useState("Facebook");
	const [message, setMessage] = useState("");
	const [loginStatus, setLoginStatus] = useState({
		facebook: false,
		twitter: false,
		instagram: false,
		linkedin: false
	});

	const platforms = ["Facebook", "Twitter", "Instagram", "LinkedIn"];

	const handlePlatformSelect = (platform) => {
		setSelectedPlatform(platform);
	};

	const extractContentForPlatform = (platform) => {
		const regex = new RegExp(
			`#\\s*\\*\\*Post for ${platform}\\*\\*\\s*([\\s\\S]*?)(?=(?:#\\s*\\*\\*Post for|$))`,
			"i"
		);

		const match = content.match(regex);
		return match ? match[1].trim() : `No content found for ${platform}`;
	};

	const handlePublish = async () => {
		const postContent = extractContentForPlatform(selectedPlatform);
		try {
			const response = await axios.post(
				"http://sdrlb-1393110018.us-east-1.elb.amazonaws.com/api/post",
				{
					platform: selectedPlatform.toLowerCase(),
					text: postContent
				}
			);

			if (response.data.success) {
				setMessage(`Successfully posted to ${selectedPlatform}`);
			} else {
				setMessage(`Error: ${response.data.error}`);
			}
		} catch (error) {
			setMessage(`An error occurred: ${error.message}`);
		}
	};

	const handleLogin = (platform) => {
		const backendLoginUrl = `http://sdrlb-1393110018.us-east-1.elb.amazonaws.com/${platform.toLowerCase()}/login`;
		window.location.href = backendLoginUrl;
	};

	return (
		<div className="bg-white shadow-md rounded-lg">
			<h3 className="text-xl font-bold p-4 border-b text-gray-800">
				Social Media Preview
			</h3>

			{/* Social Media Connection Status */}
			<div className="p-4 bg-gray-50 border-b">
				<h4 className="text-sm font-medium text-gray-700 mb-3">
					Connect Your Accounts
				</h4>
				<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
					{platforms.map((platform) => (
						<button
							key={`login-${platform}`}
							onClick={() => handleLogin(platform)}
							className={`flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								loginStatus[platform.toLowerCase()]
									? "bg-green-100 text-green-800 hover:bg-green-200"
									: "bg-gray-100 text-gray-800 hover:bg-gray-200"
							}`}
						>
							<i className={`fab fa-${platform.toLowerCase()} mr-2`}></i>
							{loginStatus[platform.toLowerCase()]
								? `Connected to ${platform}`
								: `Connect ${platform}`}
						</button>
					))}
				</div>
			</div>

			{/* Platform Selection */}
			<div className="grid grid-cols-2 gap-2 p-4 bg-gray-800">
				{platforms.map((platform) => (
					<button
						key={platform}
						className={`px-3 py-2 font-medium text-sm rounded-lg transition-colors ${
							selectedPlatform === platform
								? "bg-blue-600 text-white"
								: "bg-gray-600 text-gray-200 hover:bg-gray-500"
						}`}
						onClick={() => handlePlatformSelect(platform)}
					>
						<i
							className={`fab fa-${platform.toLowerCase()} text-green-600 m-2`}
						></i>
						{platform}
					</button>
				))}
			</div>

			{/* Content Preview */}
			<div className="p-4">
				<div className="markdown-content mb-4 max-h-96 overflow-y-auto">
					<ReactMarkdown remarkPlugins={[remarkGfm]}>
						{extractContentForPlatform(selectedPlatform)}
					</ReactMarkdown>
				</div>

				{message && (
					<div
						className={`mb-4 p-3 rounded-lg ${
							message.includes("Error")
								? "bg-red-100 text-red-700"
								: "bg-green-100 text-green-700"
						}`}
					>
						{message}
					</div>
				)}

				<button
					className="w-full px-4 py-2.5 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
					onClick={handlePublish}
				>
					{`Publish to ${selectedPlatform}`}
				</button>
			</div>
		</div>
	);
};

export default SocialMediaPost;
