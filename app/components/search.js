import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import React from "react";

export const Search = ({ placeholder, onChange, value }) => {
	return (
		<div className="w-[300px] gap-3 h-[42px] px-2 relative bg-[#0b1739] rounded border border-[#343a4e] flex items-center  justify-center">
			<MagnifyingGlassIcon className="text-[#adb9e1] h-5" />
			<input
				type="text"
				placeholder={placeholder}
				onChange={onChange}
				value={value}
				className="bg-[#0b1739] text-[#adb9e1] text-xs font-medium font-['Work Sans'] leading-[14px] w-full h-full border-none outline-none rounded"
			/>
		</div>
	);
};
