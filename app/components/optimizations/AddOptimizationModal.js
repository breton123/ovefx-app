import React, { useState } from "react";

const AddOptimizationModal = ({ isOpen, onClose, onSubmit }) => {
	const [optimizationData, setOptimizationData] = useState({
		optimizationName: "",
		expertName: "",
		optimizationFiles: [],
		symbols: [],
		period: "M1",
		startDate: "",
		endDate: new Date().toISOString().split("T")[0],
		forward: "No",
		delays: "Zero Latency",
		customDelay: "",
		modelling: "Every tick",
		deposit: "",
		leverage: "",
		optModel: "Disabled",
		optCriterion: "Balance max",
		scheduleStart: false,
		scheduledDate: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setOptimizationData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handleFileChange = (e) => {
		setOptimizationData((prevData) => ({
			...prevData,
			optimizationFiles: Array.from(e.target.files),
		}));
	};

	const handleSymbolsChange = (e) => {
		setOptimizationData((prevData) => ({
			...prevData,
			symbols: e.target.value.split(",").map((s) => s.trim()),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		onSubmit(optimizationData);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			<div className="bg-white p-8 rounded-lg shadow-xl w-[600px] max-h-[90vh] overflow-y-auto">
				<h2 className="text-2xl font-bold mb-4">
					Add New Optimization
				</h2>
				<form onSubmit={handleSubmit}>
					{/* Optimization name input */}
					<div className="mb-4">
						<label
							htmlFor="optimizationName"
							className="block text-sm font-medium text-gray-700">
							Optimization Name
						</label>
						<input
							type="text"
							id="optimizationName"
							name="optimizationName"
							value={optimizationData.optimizationName}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
						/>
					</div>
					{/* Expert name input */}
					<div className="mb-4">
						<label
							htmlFor="expertName"
							className="block text-sm font-medium text-gray-700">
							Expert Name
						</label>
						<input
							type="text"
							id="expertName"
							name="expertName"
							value={optimizationData.expertName}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
						/>
					</div>

					{/* Optimization files input */}
					<div className="mb-4">
						<label
							htmlFor="optimizationFiles"
							className="block text-sm font-medium text-gray-700">
							Optimization Files (.set)
						</label>
						<input
							type="file"
							id="optimizationFiles"
							name="optimizationFiles"
							onChange={handleFileChange}
							accept=".set"
							multiple
							className="mt-1 block w-full"
							required
						/>
					</div>

					{/* Symbols input */}
					<div className="mb-4">
						<label
							htmlFor="symbols"
							className="block text-sm font-medium text-gray-700">
							Symbols (comma-separated)
						</label>
						<input
							type="text"
							id="symbols"
							name="symbols"
							value={optimizationData.symbols.join(", ")}
							onChange={handleSymbolsChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							required
						/>
					</div>

					{/* Period dropdown */}
					<div className="mb-4">
						<label
							htmlFor="period"
							className="block text-sm font-medium text-gray-700">
							Period
						</label>
						<select
							id="period"
							name="period"
							value={optimizationData.period}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							{[
								"M1",
								"M5",
								"M10",
								"M15",
								"M30",
								"H1",
								"H2",
								"H4",
								"H12",
								"Daily",
								"Weekly",
								"Monthly",
							].map((period) => (
								<option key={period} value={period}>
									{period}
								</option>
							))}
						</select>
					</div>

					{/* Start and End date inputs */}
					<div className="mb-4 flex space-x-4">
						<div className="flex-1">
							<label
								htmlFor="startDate"
								className="block text-sm font-medium text-gray-700">
								Start Date
							</label>
							<input
								type="date"
								id="startDate"
								name="startDate"
								value={optimizationData.startDate}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
								required
							/>
						</div>
						<div className="flex-1">
							<label
								htmlFor="endDate"
								className="block text-sm font-medium text-gray-700">
								End Date
							</label>
							<input
								type="date"
								id="endDate"
								name="endDate"
								value={optimizationData.endDate}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
								required
							/>
						</div>
					</div>

					{/* Forward dropdown */}
					<div className="mb-4">
						<label
							htmlFor="forward"
							className="block text-sm font-medium text-gray-700">
							Forward
						</label>
						<select
							id="forward"
							name="forward"
							value={optimizationData.forward}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							{["No", "1/2", "1/3", "1/4"].map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					{/* Delays dropdown and custom input */}
					<div className="mb-4">
						<label
							htmlFor="delays"
							className="block text-sm font-medium text-gray-700">
							Delays
						</label>
						<select
							id="delays"
							name="delays"
							value={optimizationData.delays}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							{["Zero Latency", "Random Delay", "Custom"].map(
								(option) => (
									<option key={option} value={option}>
										{option}
									</option>
								)
							)}
						</select>
						{optimizationData.delays === "Custom" && (
							<input
								type="number"
								id="customDelay"
								name="customDelay"
								value={optimizationData.customDelay}
								onChange={handleChange}
								placeholder="Custom delay in ms"
								className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							/>
						)}
					</div>

					{/* Modelling dropdown */}
					<div className="mb-4">
						<label
							htmlFor="modelling"
							className="block text-sm font-medium text-gray-700">
							Modelling
						</label>
						<select
							id="modelling"
							name="modelling"
							value={optimizationData.modelling}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							{[
								"Every tick",
								"Every tick based on real ticks",
								"1 minute OHLC",
								"Open prices only",
								"Math calculations",
							].map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					{/* Deposit and Leverage inputs */}
					<div className="mb-4 flex space-x-4">
						<div className="flex-1">
							<label
								htmlFor="deposit"
								className="block text-sm font-medium text-gray-700">
								Deposit
							</label>
							<input
								type="number"
								id="deposit"
								name="deposit"
								value={optimizationData.deposit}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
								required
							/>
						</div>
						<div className="flex-1">
							<label
								htmlFor="leverage"
								className="block text-sm font-medium text-gray-700">
								Leverage
							</label>
							<input
								type="number"
								id="leverage"
								name="leverage"
								value={optimizationData.leverage}
								onChange={handleChange}
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
								required
							/>
						</div>
					</div>

					{/* Opt Model dropdown */}
					<div className="mb-4">
						<label
							htmlFor="optModel"
							className="block text-sm font-medium text-gray-700">
							Optimization Model
						</label>
						<select
							id="optModel"
							name="optModel"
							value={optimizationData.optModel}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							{[
								"Disabled",
								"Slow complete algorithm",
								"Fast genetic based algorithm",
							].map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					{/* Opt Criterion dropdown */}
					<div className="mb-4">
						<label
							htmlFor="optCriterion"
							className="block text-sm font-medium text-gray-700">
							Optimization Criterion
						</label>
						<select
							id="optCriterion"
							name="optCriterion"
							value={optimizationData.optCriterion}
							onChange={handleChange}
							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
							{[
								"Balance max",
								"Profit factor max",
								"Expected payoff max",
								"Drawdown min",
								"Recovery factor max",
								"Sharpe ratio max",
								"Custom max",
								"Complex criterion max",
							].map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>

					{/* Schedule start checkbox and date input */}
					<div className="mb-4">
						<label className="flex items-center">
							<input
								type="checkbox"
								name="scheduleStart"
								checked={optimizationData.scheduleStart}
								onChange={(e) =>
									setOptimizationData((prevData) => ({
										...prevData,
										scheduleStart: e.target.checked,
									}))
								}
								className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							/>
							<span className="ml-2 text-sm text-gray-700">
								Schedule start
							</span>
						</label>
						{optimizationData.scheduleStart && (
							<input
								type="datetime-local"
								name="scheduledDate"
								value={optimizationData.scheduledDate}
								onChange={handleChange}
								className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
							/>
						)}
					</div>
					{/* Submit and Cancel buttons */}
					<div className="flex justify-end space-x-2">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
							{optimizationData.scheduleStart
								? "Schedule Optimization"
								: "Start Optimization"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddOptimizationModal;
