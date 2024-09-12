export function calculatePercentageChange(oldValue, newValue) {
	if (oldValue === 0) return null; // Avoid division by zero
	return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}
