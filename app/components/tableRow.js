import { Cog6ToothIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import React from "react";

const TableRow = ({
	row,
	visibleColumns,
	isOdd,
	viewButton,
	settingsButton,
	deleteButton,
	onSelect,
	selectedAccount,
	pageType, // Add this prop to determine the current page
}) => {
	const router = useRouter();

	const openSettings = (e) => {
		e.stopPropagation(); // Prevent row selection
		onSelect(true); // Indicate it's an action button click
		settingsButton(row);
	};

	const handleViewButton = (e) => {
		e.stopPropagation();
		onSelect(true);
		if (pageType === "sets") {
			router.push(`/set?accountId=${selectedAccount}&setId=${row.id}`);
		} else if (pageType === "accounts") {
			router.push(`/sets?id=${row.login}`);
		} else {
			viewButton(row);
		}
	};

	const deleteRow = (e) => {
		e.stopPropagation(); // Prevent row selection
		onSelect(true); // Indicate it's an action button click
		if (pageType === "copiers") {
			deleteButton(row);
		} else {
			deleteButton(row.id);
		}
	};

	const formatValue = (value) => {
		if (typeof value === "number" && !Number.isInteger(value)) {
			return Number(value.toFixed(2));
		}
		if (typeof value === "string") {
			return value.replace(".set", "");
		}
		if (typeof value === "object" && value !== null) {
			// Convert object to string representation
			return JSON.stringify(value);
		}
		return value;
	};

	return (
		<>
			{visibleColumns.map((column) => (
				<td
					key={column}
					className="px-2 py-4 text-[#AEB9E1] text-center">
					{typeof row[column] === "boolean"
						? row[column]
							? "Yes"
							: "No"
						: formatValue(row[column])}
				</td>
			))}
			{(viewButton || settingsButton || deleteButton) && (
				<td className="px-2 py-4 text-center">
					<div className="flex justify-center gap-2">
						<EyeIcon
							onClick={handleViewButton}
							className="text-blue-600 h-5 cursor-pointer hover:scale-125 hover:text-blue-400 transition ease-in-out"
						/>
						{settingsButton && (
							<Cog6ToothIcon
								onClick={openSettings}
								className="text-gray-600 h-5 cursor-pointer hover:scale-125 hover:text-gray-400 transition ease-in-out"
							/>
						)}
						{deleteButton && (
							<TrashIcon
								onClick={deleteRow}
								className="text-red-600 h-5 cursor-pointer hover:scale-125 hover:text-red-400 transition ease-in-out"
							/>
						)}
					</div>
				</td>
			)}
		</>
	);
};

export default TableRow;
