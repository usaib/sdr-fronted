import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SocialMediaPost from "./SocialMediaPost";
import { Loader2 } from "lucide-react";

const AdvertisementPlan = () => {
	const location = useLocation();
	const { status: initialStatus, task_id } = location.state || {
		status: "processing",
		task_id: "123213"
	};

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [data, setData] = useState({
		combined_markdown: "",
		video_url: "",
		video_from_text: "",
		status: initialStatus
	});

	useEffect(() => {
		const pollStatus = async () => {
			if (!task_id) {
				setError("No task ID provided");
				setLoading(false);
				return;
			}

			try {
				const response = await fetch(
					`http://sdrlb-1393110018.us-east-1.elb.amazonaws.com/api/advertise/status/${task_id}`
				);
				const result = await response.json();

				if (result.status === "completed" && result.result) {
					setData({
						combined_markdown: result.result.combined_markdown || "",
						video_url: result.result.video_url || "",
						video_from_text: result.result.video_from_text || "",
						status: "completed"
					});
					setLoading(false);
				} else if (result.status === "failed") {
					setError(result.error || "Task failed");
					setLoading(false);
				} else if (result.status === "not_found") {
					setError(result.error || "Sorry, Not found.");
					setLoading(false);
				} else if (result.status === "processing") {
					// Continue polling
					setTimeout(() => pollStatus(), 2000); // Poll every 2 seconds
				}
			} catch (err) {
				setError("Failed to fetch status");
				setLoading(false);
			}
		};

		pollStatus();
	}, [task_id]);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-6">
				<div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-md">
					<Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
					<h2 className="text-xl font-semibold text-gray-800">
						Generating Your Advertisement Plan
					</h2>
					<p className="text-gray-600 text-center">
						This may take a few minutes. We're crafting your content and
						generating videos...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen p-6">
				<div className="p-6 bg-white rounded-lg shadow-md">
					<h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
					<p className="text-gray-700">{error}</p>
				</div>
			</div>
		);
	}

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
						{data.combined_markdown}
					</ReactMarkdown>
				</div>
				{data.video_url && (
					<>
						<h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
							Generated Video from Image
						</h3>
						<video
							controls
							autoPlay
							className="w-full rounded-lg shadow-lg mb-8"
						>
							<source src={data.video_url} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					</>
				)}
				{data.video_from_text && (
					<>
						<h3 className="text-xl font-bold mb-4 text-gray-800 text-center">
							Generated Video from Text Prompt
						</h3>
						<video controls autoPlay className="w-full rounded-lg shadow-lg">
							<source src={data.video_from_text} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					</>
				)}
			</div>

			{/* Social Media Preview Column */}
			<div className="w-1/3 sticky top-6 h-fit">
				<SocialMediaPost content={data.combined_markdown} />
			</div>
		</div>
	);
};

export default AdvertisementPlan;
