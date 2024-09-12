import {
	ArrowDownIcon,
	ArrowUpIcon,
	EllipsisHorizontalIcon,
	EyeIcon,
} from "@heroicons/react/24/solid";

export function Card({ title, value, trend }) {
	const isPositiveTrend = trend > 0;
	const trendColor = isPositiveTrend ? "text-[#14c973]" : "text-red-500";
	const TrendIcon = isPositiveTrend ? ArrowUpIcon : ArrowDownIcon;
	const bgColor = isPositiveTrend ? "bg-[#05c168]/20" : "bg-red-500/20";
	const borderColor = isPositiveTrend
		? "border-[#05c168]/20"
		: "border-red-500/20";

	return (
		<div className="w-full mt-5 h-[100px] relative bg-[#0b1739] rounded-lg border border-[#343a4e] flex flex-col gap-4 items-center justify-center drop-shadow-xl">
			<div className="flex w-full items-center justify-between">
				<div className="px-5 justify-start items-center gap-2 inline-flex">
					<EyeIcon className="h-5 text-[#adb9e1]" />
					<div className="text-[#adb9e1] text-xs font-medium leading-[14px]">
						{title}
					</div>
				</div>
				<EllipsisHorizontalIcon className="h-6 text-[#adb9e1] pr-3" />
			</div>
			<div className="h-8 w-full px-5 justify-start items-center gap-3 inline-flex">
				<div className="text-white text-2xl font-semibold leading-loose">
					{value}
				</div>
				{trend !== 0 && (
					<div
						className={`px-1 py-0.5 ${bgColor} rounded-sm h-3/4 items-center border ${borderColor} flex justify-start gap-1.5`}>
						<div
							className={`${trendColor} text-[10px] font-bold leading-[14px]`}>
							{Math.abs(trend).toFixed(2)}%
						</div>
						<TrendIcon className={`h-4 ${trendColor}`} />
					</div>
				)}
			</div>
		</div>
	);
}
