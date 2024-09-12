import React from "react";

export function Input({
	type = "text",
	placeholder,
	value,
	onChange,
	className = "",
}) {
	return (
		<input
			type={type}
			placeholder={placeholder}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			className={`px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
		/>
	);
}
