export function Spinner({ className }) {
	return (
		<div
			className={`fixed inset-0 w-screen h-screen items-center justify-center bg-[#081028] bg-opacity-50 backdrop-blur-sm z-50 ${className}`}>
			<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
		</div>
	);
}
