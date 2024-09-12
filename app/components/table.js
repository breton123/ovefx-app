import {
	ArrowDownIcon,
	ArrowUpIcon,
	TrashIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion"; // Add this import
import React, { useEffect, useState } from "react";
import TableRow from "./tableRow";

function capitalizeFirstLetter(str) {
	if (typeof str !== "string" || str.length === 0) {
		return str; // Return the original string if it's not a string or is empty
	}
	return str.charAt(0).toUpperCase() + str.slice(1);
}

const Table = ({
	data,
	title,
	viewButton,
	settingsButton,
	filtersEnabled = true,
	defaultHiddenColumns = [], // Add this prop
	defaultRowsPerPage = 5,
	deleteButton,
	onRowSelection = () => {},
	selectable = false,
	toggleHideDisabledSets,
	onSelectedSetsChange = () => {}, // Add this prop
	onToggleSelectedRows = () => {}, // Add this new prop
	selectedAccount,
}) => {
	const [hiddenColumns, setHiddenColumns] = useState(defaultHiddenColumns);
	const [filters, setFilters] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
	const [showDisabledSets, setShowDisabledSets] = useState(false);
	const [sortColumn, setSortColumn] = useState(null);
	const [sortDirection, setSortDirection] = useState("asc");
	const [selectedRows, setSelectedRows] = useState([]);
	const [showSelectedRows, setShowSelectedRows] = useState(false);

	// Update the headers logic
	let headers = [];
	if (data.length > 0) {
		headers = Object.keys(data[0]);
	}

	if (title === "Accounts") {
		headers = ["name", "login", "server", "enabled"];
	} else if (title === "Sets") {
		headers = [
			"magic",
			"symbol",
			"name",
			"strategy",
			"profit",
			"maxDrawdown",
			"profitFactor",
			"returnOnDrawdown",
			"winRate",
			"minTradeDuration",
			"maxTradeDuration",
			"avgTradeDuration",
			"minLotSize",
			"maxLotSize",
			"avgLotSize",
			"wins",
			"losses",
			"totalTrades",
			"oveScore",
			"enabled",
		];
	} else if (title === "Open Sets") {
		headers = [
			"magic",
			"name",
			"strategy",
			"profit",
			"maxDrawdown",
			"openDrawdown",
			"openEquity",
		];
	} else if (title == "Set Finder") {
		headers = [
			"Pass",
			"Result",
			"Profit",
			"Recovery Factor",
			"Profit Factor",
			"Equity DD %",
			"Expected Payoff",
			"Trades",
			"oveScore",
		];
	}

	// Set default hidden columns (empty array) based on title
	React.useEffect(() => {
		setHiddenColumns(defaultHiddenColumns);
	}, [JSON.stringify(defaultHiddenColumns)]); // Use JSON.stringify to compare array contents

	const handleColumnToggle = (column) => {
		setHiddenColumns((prev) =>
			prev.includes(column)
				? prev.filter((col) => col !== column)
				: [...prev, column]
		);
	};

	const handleRowsPerPageChange = (event) => {
		setRowsPerPage(Number(event.target.value));
		setCurrentPage(1); // Reset to first page when changing rows per page
	};

	const handleSort = (column) => {
		if (sortColumn === column) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column);
			setSortDirection("asc");
		}
	};

	// Update reorderedData to filter out rows with magic 0 and handle disabled sets
	const reorderedData = data
		.filter((row) => {
			if (title === "Sets") {
				return (
					row.magic !== 0 &&
					(showDisabledSets || row.enabled !== false)
				);
			}
			if (title === "Open Sets") {
				return row.openEquity != 0;
			}
			return true;
		})
		.sort((a, b) => {
			if (!sortColumn) return 0;
			if (a[sortColumn] < b[sortColumn])
				return sortDirection === "asc" ? -1 : 1;
			if (a[sortColumn] > b[sortColumn])
				return sortDirection === "asc" ? 1 : -1;
			return 0;
		});

	// Calculate pagination
	const indexOfLastRow = currentPage * rowsPerPage;
	const indexOfFirstRow = indexOfLastRow - rowsPerPage;
	const currentRows = reorderedData.slice(indexOfFirstRow, indexOfLastRow);
	const totalPages = Math.ceil(reorderedData.length / rowsPerPage);

	const paginate = (pageNumber) => setCurrentPage(pageNumber);

	const toggleFilters = () => {
		setFilters(!filters);
	};

	const toggleDisabledSets = () => {
		toggleHideDisabledSets();
		setShowDisabledSets(!showDisabledSets);
	};

	const toggleSelectedRows = () => {
		setShowSelectedRows(!showSelectedRows);
		onToggleSelectedRows(!showSelectedRows);
	};

	const handleRowSelection = ({ rowId, isActionButton = false }) => {
		if (isActionButton) return; // Don't change selection if it's an action button click
		setSelectedRows((prevSelected) => {
			const newSelected = prevSelected.includes(rowId)
				? prevSelected.filter((id) => id !== rowId)
				: [...prevSelected, rowId];

			onRowSelection(newSelected);
			onSelectedSetsChange(newSelected);
			return newSelected;
		});
	};

	return (
		<div className="w-full relative mt-10 bg-[#0b1739] rounded-xl shadow border border-[#343a4e]">
			{/* Column Selector */}
			{filtersEnabled && (
				<>
					<div className="flex items-center mt-5 ml-5">
						<button onClick={toggleFilters}>
							<div
								className={`p-2 w-16 h-[30px] ${
									filters ? "bg-[#cb3cff]" : "bg-[#AEB9E1]"
								} rounded flex justify-center items-center gap-1.5 cursor-pointer`}>
								<div className="text-center text-white text-xs font-medium leading-[14px] ">
									Filters {filters ? "-" : "+"}
								</div>
							</div>
						</button>
						{title === "Sets" && (
							<>
								<button
									onClick={toggleDisabledSets}
									className="ml-4">
									<div
										className={`p-2 h-[30px] ${
											showDisabledSets
												? "bg-[#cb3cff]"
												: "bg-[#AEB9E1]"
										} rounded flex justify-center items-center gap-1.5 cursor-pointer`}>
										<div className="text-center text-white text-xs font-medium leading-[14px] ">
											{showDisabledSets
												? "Hide Disabled"
												: "Show Disabled"}
										</div>
									</div>
								</button>
								<button
									onClick={toggleSelectedRows}
									disabled={selectedRows.length === 0}
									className="ml-4">
									<div
										className={`p-2 h-[30px] ${
											showSelectedRows
												? "bg-[#cb3cff]"
												: "bg-[#AEB9E1]"
										} rounded flex justify-center items-center gap-1.5 cursor-pointer ${
											selectedRows.length === 0
												? "opacity-50 cursor-not-allowed"
												: ""
										}`}>
										<div className="text-center text-white text-xs font-medium leading-[14px]">
											{showSelectedRows
												? "Show All"
												: "Show Selected"}
										</div>
									</div>
								</button>
							</>
						)}
					</div>
					{filters && (
						<div className="w-full flex">
							<div className="p-4 flex flex-wrap gap-5 w-1/2">
								{headers.map((header) => (
									<div
										key={header}
										className="flex items-center text-white">
										<input
											type="checkbox"
											checked={
												!hiddenColumns.includes(header)
											}
											onChange={() =>
												handleColumnToggle(header)
											}
											className="mr-2"
										/>
										<label>
											{capitalizeFirstLetter(header)}
										</label>
									</div>
								))}
							</div>
						</div>
					)}
				</>
			)}

			{/* Table Header */}
			<div className="flex w-full justify-between p-7 font-semibold">
				<div className="text-white text-base font-bold leading-[18px]">
					{title}
				</div>
				<div className="">
					<span className="text-[#cb3cff] text-sm font-medium leading-[14px]">
						{indexOfFirstRow + 1} -{" "}
						{Math.min(indexOfLastRow, reorderedData.length)}
					</span>
					<span className="text-[#adb9e1] text-sm font-medium leading-[14px]">
						{" "}
						of {reorderedData.length}
					</span>
				</div>
			</div>

			{/* Update the table structure */}
			<div className="overflow-x-auto px-2">
				{" "}
				{/* Add horizontal padding */}
				<table className="min-w-full w-auto bg-[#0b1739] rounded-xl shadow">
					<thead>
						<tr>
							{headers
								.filter(
									(header) => !hiddenColumns.includes(header)
								)
								.map((header) => (
									<th
										key={header}
										className={`text-white text-center font-semibold p-2 cursor-pointer ${
											sortColumn === header
												? "bg-[#cb3cff]"
												: ""
										}`}
										onClick={() => handleSort(header)}>
										<div className="flex items-center justify-center">
											{capitalizeFirstLetter(header)}
											{sortColumn === header &&
												(sortDirection === "asc" ? (
													<ArrowUpIcon className="w-4 h-4 ml-1" />
												) : (
													<ArrowDownIcon className="w-4 h-4 ml-1" />
												))}
										</div>
									</th>
								))}
							{(viewButton || settingsButton || deleteButton) && (
								<th className="text-white text-center font-semibold p-2">
									Actions
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{currentRows.map((row, index) => (
							<motion.tr
								key={row.id || index}
								onClick={() =>
									handleRowSelection({ rowId: row.id })
								}
								className={`cursor-pointer transition-all duration-300 ease-in-out
                        ${
							selectedRows.includes(row.id)
								? "bg-[#1c2951]"
								: (indexOfFirstRow + index) % 2 !== 0
								? "bg-[#0f1d40]"
								: "bg-[#0b1739]"
						}
                        hover:bg-[#2a3b6d]`}
								whileHover={{ scale: 1.005 }}
								whileTap={{ scale: 0.995 }}>
								<TableRow
									row={row}
									visibleColumns={headers.filter(
										(col) => !hiddenColumns.includes(col)
									)}
									isOdd={(indexOfFirstRow + index) % 2 !== 0}
									viewButton={viewButton}
									settingsButton={settingsButton}
									selectedAccount={selectedAccount}
									deleteButton={deleteButton}
									selectable={selectable}
									selected={selectedRows.includes(row.id)}
									onSelect={(isActionButton) =>
										handleRowSelection({
											rowId: row.id,
											isActionButton,
										})
									}
									pageType={title.toLowerCase()} // Add this line
								/>
							</motion.tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex justify-end items-center mt-4 pb-2 pr-10 w-full">
				<div className="flex items-center mr-4">
					<label htmlFor="rowsPerPage" className="text-white mr-2">
						Rows per page:
					</label>
					<select
						id="rowsPerPage"
						value={rowsPerPage}
						onChange={handleRowsPerPageChange}
						className="bg-[#AEB9E1] text-[#0b1739] rounded px-2 py-1">
						<option value="5">5</option>
						<option value="10">10</option>
						<option value="20">20</option>
						<option value="50">50</option>
					</select>
				</div>

				{Array.from({ length: totalPages }, (_, i) => (
					<button
						key={i}
						onClick={() => paginate(i + 1)}
						className={`mx-1 px-3 py-1 rounded ${
							currentPage === i + 1
								? "bg-[#cb3cff] text-white"
								: "bg-[#AEB9E1] text-[#0b1739]"
						}`}>
						{i + 1}
					</button>
				))}
			</div>
		</div>
	);
};

export default Table;
