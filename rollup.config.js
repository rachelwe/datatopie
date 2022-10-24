function buildConfig(inputFileName, outputFileName) {
	return {
		input: `src/js/${inputFileName}`,
		output: {
			format: 'es',
			file: `dist/js/${outputFileName}.js`
		},
		// ... Other configs
	}
}


export default [
	buildConfig('script.js', 'app'),
	buildConfig('graph-pie.js', 'graph-pie'),
]

// export default {
// 	input: 'src/js/script.js',
// 	output: [
// 		{
// 			file: 'dist/js/app.js',
// 			format: 'es'
// 		}
// 	]
// };
