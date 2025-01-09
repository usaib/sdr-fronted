import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import PDLJS from "peopledatalabs";

// Create a client, specifying your API key
const PDLJSClient = new PDLJS({
	apiKey: "9abdf9ad182545e08ca6e37c51a8600bc21dedd9f094463c71bc7f4d9ea10e14"
});
const AutocompleteInput = ({
	field,
	value,
	onChange,
	placeholder,
	label,
	multiSelect = false
}) => {
	const [suggestions, setSuggestions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const wrapperRef = useRef(null);
	const inputRef = useRef(null);

	// Convert value to array if multiSelect
	const values = multiSelect ? (Array.isArray(value) ? value : []) : value;

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const debounce = (func, wait) => {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), wait);
		};
	};

	const fetchSuggestions = async (text) => {
		if (!text) {
			setSuggestions([]);
			return;
		}

		setIsLoading(true);
		try {
			const response = await PDLJSClient.autocomplete({
				field,
				text,
				size: 10
			});
			setSuggestions(
				response.data.filter((item) => !multiSelect || !values.includes(item))
			);
		} catch (error) {
			console.error("Error fetching suggestions:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

	const handleInputChange = (e) => {
		const text = e.target.value;
		setInputValue(text);
		if (!multiSelect) {
			onChange(text);
		}
		debouncedFetchSuggestions(text);
		setShowSuggestions(true);
	};

	const handleSuggestionClick = (suggestion) => {
		if (multiSelect) {
			onChange([...values, suggestion.name]);
			setInputValue("");
			inputRef.current?.focus();
		} else {
			onChange(suggestion.name);
			setInputValue(suggestion.name);
		}
		setSuggestions([]);
		setShowSuggestions(false);
	};

	const removeValue = (valueToRemove) => {
		if (multiSelect) {
			onChange(values.filter((v) => v !== valueToRemove));
		}
	};

	const handleKeyDown = (e) => {
		if (
			multiSelect &&
			e.key === "Backspace" &&
			!inputValue &&
			values.length > 0
		) {
			removeValue(values[values.length - 1]);
		}
	};

	return (
		<div className="relative" ref={wrapperRef}>
			<label className="block text-sm font-medium text-gray-700 mb-2">
				{label}
			</label>
			<div className="w-full p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white min-h-[42px]">
				<div className="flex flex-wrap gap-2">
					{multiSelect &&
						values.map((v, index) => (
							<span
								key={index}
								className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800"
							>
								{v}
								<button
									type="button"
									onClick={() => removeValue(v)}
									className="ml-1 inline-flex items-center"
								>
									<X className="h-3 w-3" />
								</button>
							</span>
						))}
					<input
						ref={inputRef}
						type="text"
						value={multiSelect ? inputValue : values}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onFocus={() => inputValue && debouncedFetchSuggestions(inputValue)}
						className="flex-1 outline-none min-w-[100px] bg-transparent"
						placeholder={multiSelect && values.length > 0 ? "" : placeholder}
					/>
				</div>
			</div>

			{isLoading && (
				<div className="absolute right-3 top-9">
					<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
				</div>
			)}

			{showSuggestions && suggestions.length > 0 && (
				<ul className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
					{suggestions.map((suggestion, index) => (
						<li
							key={index}
							onClick={() => handleSuggestionClick(suggestion)}
							className="cursor-pointer select-none relative py-2 px-3 hover:bg-blue-50 text-gray-900"
						>
							{suggestion.name}
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default AutocompleteInput;
