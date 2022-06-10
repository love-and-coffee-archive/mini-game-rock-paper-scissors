const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'development',
	entry: './src/index.ts',
	devtool: 'inline-source-map',
	devServer: {
		static: './dev',
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dev'),
		clean: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Mini Game - Test Environment',
		}),
	],
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader'],
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					"style-loader",
					// Translates CSS into CommonJS
					"css-loader",
					// Compiles Sass to CSS
					"sass-loader",
				],
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.html$/i,
				loader: "html-loader",
			},
		],
	},
	optimization: {
		runtimeChunk: 'single',
	},
};
