import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
	const navigate = useNavigate();

	const handleCardClick = (path) => {
		navigate(path);
	};

	return (
		<div className="flex justify-center items-center h-screen bg-gray-100">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div
					className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
					onClick={() => handleCardClick("/campaign-recommendation")}
				>
					<img
						src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OiskTWL78Xp4ekBqe_UB3l85s5jLmsaeTA&s"
						alt="Mike Wohlert"
						className="w-16 h-16 object-cover rounded-full top-4 left-4"
					/>
					<h2 className="text-xl font-bold mt-4">SDR by Mike Wohlert</h2>
					<p className="mt-2 text-gray-600">
						Description about Mike Wohlert and the SDR type.
					</p>
				</div>
				<div
					className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow"
					onClick={() => handleCardClick("/advertise-manager")}
				>
					<img
						src="https://media.licdn.com/dms/image/v2/D4D03AQFs5kS0pHlJFw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1713240667409?e=2147483647&v=beta&t=UZjCHbUs0GIW2OaM5wgd3TbNZqldQi72UwdnANXeOOA"
						alt="Usaib Khan"
						className="w-16 h-16 object-cover rounded-full top-4 left-4"
					/>
					<h2 className="text-xl font-bold mt-4">
						Advertise Manager by Usaib Khan
					</h2>
					<p className="mt-2 text-gray-600">
						Description about Usaib Khan and the Advertise Manager type.
					</p>
				</div>
			</div>
		</div>
	);
}

export default Home;
