interface ProgressionDisplayProps {
	currentBlocks: number;
	totalBlocks: number;
}

export const ProgressionDisplay = ({
	currentBlocks,
	totalBlocks,
}: ProgressionDisplayProps) => {
	const style = {
		marginTop: 10,
		paddingTop: 10,
		borderTop: "1px solid #999",
	};

	return (
		<div style={style}>
			<div style={{ fontWeight: "bold" }}>
				Blocs placés : {currentBlocks} / {totalBlocks}
			</div>
		</div>
	);
};
