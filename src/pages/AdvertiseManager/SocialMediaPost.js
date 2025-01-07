import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SocialMediaPost = ({ content }) => {
	const [selectedPlatform, setSelectedPlatform] = useState("Facebook");
	const platforms = ["Facebook", "Twitter", "Instagram", "LinkedIn"];

	const handlePlatformSelect = (platform) => {
		setSelectedPlatform(platform);
	};

	const extractContentForPlatform = (platform) => {
        const regex = new RegExp(
            `#\\s*\\*\\*Post for ${platform}\\*\\*\\s*([\\s\\S]*?)(?=(?:#\\s*\\*\\*Post for|$))`,
            'i'
        );
        
        const match = content.match(regex);
        return match ? match[1].trim() : `No content found for ${platform}`;
	};

	const handlePublish = () => {
		alert(`Publishing to ${selectedPlatform}`);
		// Here you would integrate with the respective social media API
	};

	return (
		<div className="bg-white shadow-md rounded-lg">
			<h3 className="text-xl font-bold p-4 border-b text-gray-800">
				Social Media Preview
			</h3>
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
						<i className={`fab fa-${platform.toLowerCase()} text-green-600 m-2`}></i>
						{platform}
					</button>
				))}
			</div>
			<div className="p-4">
				<div className="markdown-content mb-4 max-h-96 overflow-y-auto">
					<ReactMarkdown remarkPlugins={[remarkGfm]}>
						{extractContentForPlatform(selectedPlatform)}
					</ReactMarkdown>
				</div>
				<button
					className="w-full px-4 py-2.5 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors"
					onClick={handlePublish}
				>
					Publish to {selectedPlatform}
				</button>
			</div>
		</div>
	);
};

export default SocialMediaPost;