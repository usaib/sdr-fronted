import React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const LoadingSteps = ({ currentStep }) => {
	const getSteps = (platforms) => {
		const baseSteps = [
			"Collecting website information",
			"Reading internal knowledge base"
		];

		// Add platform-specific steps
		const platformSteps = platforms.map(
			(platform) =>
				`Creating posts for ${
					platform.charAt(0).toUpperCase() + platform.slice(1)
				}`
		);

		// Add content generation steps
		const contentSteps = ["Generating video content", "Creating custom images"];

		return [...baseSteps, ...platformSteps, ...contentSteps];
	};

	const steps = getSteps(["facebook", "instagram", "twitter", "linkedin"]);

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
			<div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
				<h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
					Generating Advertisement Plan
				</h2>

				<div className="space-y-4">
					{steps.map((step, index) => (
						<div
							key={step}
							className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
								index === currentStep
									? "bg-blue-50 border border-blue-100"
									: index < currentStep
									? "text-gray-500"
									: "text-gray-400"
							}`}
						>
							{index < currentStep ? (
								<CheckCircle2 className="w-5 h-5 text-green-500 animate-appear" />
							) : index === currentStep ? (
								<Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
							) : (
								<div className="w-5 h-5 rounded-full border-2 border-gray-200" />
							)}
							<span className="font-medium">{step}</span>
						</div>
					))}
				</div>

				<div className="mt-8">
					<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
						<div
							className="h-full bg-blue-500 transition-all duration-500 rounded-full"
							style={{
								width: `${(currentStep / (steps.length - 1)) * 100}%`
							}}
						/>
					</div>
					<p className="text-center text-gray-600 mt-4">
						{Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoadingSteps;
