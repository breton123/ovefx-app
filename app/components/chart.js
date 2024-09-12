import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// Sample data
const sampleData = [
	{ time: "00:00", Magic1: 4000, Magic2: 2400, Magic3: 2400 },
	{ time: "03:00", Magic1: 3000, Magic2: 1398, Magic3: 2210 },
	{ time: "06:00", Magic1: 2000, Magic2: 9800, Magic3: 2290 },
	{ time: "09:00", Magic1: 2780, Magic2: 3908, Magic3: 2000 },
	{ time: "12:00", Magic1: 1890, Magic2: 4800, Magic3: 2181 },
	{ time: "15:00", Magic1: 2390, Magic2: 3800, Magic3: 2500 },
	{ time: "18:00", Magic1: 3490, Magic2: 4300, Magic3: 2100 },
];

export const Chart = ({
	data = sampleData,
	magics = ["Magic1", "Magic2", "Magic3"],
	title = "Sample Chart",
}) => {
	return (
		<div className="w-full backdrop-blur-[120px] font-mona bg-[#0b1739] rounded-tl-xl rounded-bl-xl border border-[#343a4e]">
			<div className="flex w-full px-5 ml-20 py-5 justify-between">
				<div className="flex flex-col">
					<h1 className="text-white font-semibold text-lg">
						{title}
					</h1>
				</div>
			</div>
			<ResponsiveContainer
				width="100%"
				height={500}
				className="pr-5 pt-5">
				<LineChart data={data}>
					<XAxis dataKey="time" />
					<YAxis />
					<Tooltip />
					<Legend />
					{/* Line for Profit */}
					{magics.map((magic, index) => {
						// Generate a random color
						const randomColor = `#${Math.floor(
							Math.random() * 16777215
						).toString(16)}`;

						return (
							<Line
								type="monotone"
								dataKey={magic}
								stroke={randomColor}
								strokeWidth={2}
								dot={false}
								key={index}
							/>
						);
					})}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};
