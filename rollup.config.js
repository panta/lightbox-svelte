import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import babel from 'rollup-plugin-babel';

const ie11Build = process.env.PAP_LEGACY_BUILD;
const production = !process.env.ROLLUP_WATCH;

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

const prodOutput = [];
if (ie11Build) {
	prodOutput.push({ file: 'dist/lightbox.min.js', format: 'iife', name });
} else {
	prodOutput.push(
		{ file: 'dist/index.min.mjs', format: 'es' },
		{ file: 'dist/index.min.js', format: 'umd', name },
		{ file: 'dist/lightbox.min.js', format: 'iife', name }
	);
}

export default {
	input: !production ? 'src/main.js' : 'src/components/components.module.js',
	output: !production
		? {
			sourcemap: true,
			format: 'iife',
			name: name,
			file: 'public/bundle.js'
		}
		: prodOutput,
	plugins: [
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: css => {
				production ? css.write('dist/lightbox.css') : css.write('public/bundle.css');
			}
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration —
		// consult the documentation for details:
		// https://github.com/rollup/rollup-plugin-commonjs
		resolve({
			browser: true,
			dedupe: importee => importee === 'svelte' || importee.startsWith('svelte/')
		}),
		commonjs(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		ie11Build &&
		babel({
			extensions: ['.js', '.mjs', '.html', '.svelte'],
			runtimeHelpers: true,
			exclude: ['node_modules/@babel/**', 'node_modules/core-js/**'],
			presets: [
				[
					'@babel/preset-env',
					{
						targets: '> 1.5%, IE 11, not dead',
						useBuiltIns: 'usage',
						corejs: 3
					}
				]
			],
			plugins: []
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
