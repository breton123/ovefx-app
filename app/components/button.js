// @flow
import * as React from "react";

export const Button = ({ value, onClick }) => {
	return (
		<div
			onClick={onClick}
			className="cursor-pointer px-4 bg-[#cb3cff] rounded justify-center items-center gap-12 inline-flex">
			<div className="p-2 bg-[#cb3cff] rounded justify-center items-center gap-1 flex">
				<div className="text-center text-white text-[10px] font-medium font-['Work Sans'] leading-[14px]">
					{value}
				</div>
			</div>
		</div>
	);
};
