import React from "react";

export const Select = ({
	options,
	value,
	onChange,
	placeholder = "Select an option",
	className = "",
}) => {
	return (
		<select
			value={value || ""}
			onChange={(e) => onChange(e.target.value)}
			className={`bg-[#1E293B] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}>
			<option value="" disabled>
				{placeholder}
			</option>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
};
