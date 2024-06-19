const Blobby = () => {
	return (
		<svg
			id='blobby-svg'
			width='100'
			height='100'
			viewBox='0 0 294 294'
			xmlns='http://www.w3.org/2000/svg'
			fill='#696FFD'
			className='my-4'
		>
			<mask id='eye-mask'>
				<rect x='0' y='0' width='294' height='294' fill='white'></rect>
				<ellipse cx='125' cy='100' rx='21' ry='27' fill='black'></ellipse>
				<ellipse cx='175' cy='100' rx='21' ry='27' fill='black'></ellipse>
			</mask>
			<svg x='22' y='0'>
				<path
					d='M125,235.50646461404133C167.1062667651526,232.68379960500855,189.47239372717164,190.27732393105723,200.72271818184825,149.6038025895761C210.175884532072,115.4275826201542,203.53778899751467,77.21180763672132,174.35664497977515,57.06640619472321C146.8956457843684,38.10851844181152,112.76302381162319,51.48367180763492,84.6634424296098,69.48149142607025C47.656140929875065,93.18471774472344,-0.4663959568624758,119.69012577658856,9.90903463638626,162.3953215050973C21.771947581469952,211.22298361289532,74.86444878421283,238.86738632469016,125,235.50646461404133'
					mask='url(#eye-mask)'
					x1='50'
				></path>
			</svg>
			<ellipse cx='147' cy='267' rx='59.994' ry='18' fill='#160B45'></ellipse>
		</svg>
	)
}

export default Blobby