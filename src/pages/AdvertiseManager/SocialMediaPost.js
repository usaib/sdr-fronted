import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";

const SocialMediaPost = ({ content = "## **Dummy Content**" }) => {
    const [selectedPlatform, setSelectedPlatform] = useState("Facebook");
    const [loggedInPlatform, setLoggedInPlatform] = useState(null);
    const platforms = ["Facebook", "Twitter", "Instagram", "LinkedIn"];
    const [message, setMessage] = useState("");

    // Fetch the logged-in platform on component mount
    useEffect(() => {
        const fetchLoggedInPlatform = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/current_platform");
                setLoggedInPlatform(response.data.platform);
            } catch (error) {
                console.error("Error fetching logged-in platform:", error);
            }
        };

        fetchLoggedInPlatform();
    }, []);

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
            const response = await axios.post("http://localhost:5000/api/post", {
                platform: selectedPlatform.toLowerCase(),
                text: postContent,
            });

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
        const backendLoginUrl = `http://localhost:5000/${platform.toLowerCase()}/login`;
        window.location.href = backendLoginUrl; // Redirect the user to the backend for OAuth login.
    };

    return (
        <div className="bg-white shadow-md rounded-lg">
            <h3 className="text-xl font-bold p-4 border-b text-gray-800">
                Social Media Preview
            </h3>
            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-800">
                {platforms.map((platform) => (
                    <div key={platform} className="flex flex-col items-center gap-2">
                        <button
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
                        <button
                            className="px-3 py-2 font-medium text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            onClick={() => handleLogin(platform)}
                        >
                            Login to {platform}
                        </button>
                    </div>
                ))}
            </div>

            {loggedInPlatform && (
                <div className="p-4 text-green-600">
                    Logged in to: {loggedInPlatform}
                </div>
            )}

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
                {message && (
                    <div className="mt-4 text-center text-sm text-green-700">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialMediaPost;




