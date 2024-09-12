import {
	ArrowTrendingUpIcon,
	EllipsisHorizontalIcon,
	EyeIcon,
} from "@heroicons/react/24/solid";

export const Card = ({ title, value, percentage }) => {
	return (
		<div className="w-[249.46px] h-[100px] relative bg-[#0b1739] rounded-lg border border-[#343a4e] flex flex-col gap-4 items-center justify-center drop-shadow-xl">
			<div className="flex w-full items-center justify-between">
				<div className="px-5 justify-start items-center gap-2 inline-flex">
					<EyeIcon className="h-5 text-[#adb9e1]" />
					<div className="text-[#adb9e1] text-xs font-medium  leading-[14px]">
						{title}
					</div>
				</div>
				<EllipsisHorizontalIcon className="h-6 text-[#adb9e1] pr-3" />
			</div>
			<div className="h-8 w-full px-5 justify-start items-center gap-3 inline-flex">
				<div className="text-white text-2xl font-semibold  leading-loose">
					{value}
				</div>
				<div className="px-1 py-0.5 bg-[#05c168]/20 rounded-sm  h-3/4 items-center border border-[#05c168]/20 flex justify-start gap-1.5 ">
					<div className="text-[#14c973] text-[10px] font-bold  leading-[14px]">
						{percentage}%
					</div>
					<ArrowTrendingUpIcon className="h-4 text-[#14c973]" />
				</div>
			</div>
			<div className="w-4 h-4 left-[193.74px] top-0 absolute">
				<div className="w-3.5 h-[2.44px] left-[1.01px] top-[6.78px] absolute"></div>
			</div>
		</div>
	);
};
