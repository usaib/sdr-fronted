import React from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SocialMediaPost from "./SocialMediaPost";

const AdvertisementPlan = () => {
	const location = useLocation();
	const { combined_markdown, video_url } = location.state || {};

	return (
		<div className="flex gap-6 p-6 mx-auto max-w-8xl">
			{/* Main Content Column */}
			<div className="w-2/3 bg-white shadow-md rounded-lg p-6">
				<h2 className="text-2xl font-bold mb-6 text-gray-800">
					Advertisement Plan
				</h2>
				<div className="markdown-content mb-8">
					<ReactMarkdown
						components={{
							h1: ({ node, ...props }) => (
								<h1 className="text-3xl text-center mb-4" {...props} />
							),
							h2: ({ node, ...props }) => (
								<h2 className="text-2xl mb-4" {...props} />
							),
							h3: ({ node, ...props }) => (
								<h3 className="text-xl mb-4" {...props} />
							),
							p: ({ node, ...props }) => <p className="mb-8" {...props} />
						}}
						remarkPlugins={[remarkGfm]}
					>
						{combined_markdown}
					</ReactMarkdown>
				</div>
				<h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
					Generated Video from Image
				</h3>
				<video controls autoPlay className="w-full rounded-lg shadow-lg">
					<source src={video_url} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			</div>

			{/* Social Media Preview Column */}
			<div className="w-1/3 sticky top-6 h-fit">
				<SocialMediaPost content={combined_markdown} />
			</div>
		</div>
	);
};

export default AdvertisementPlan;
