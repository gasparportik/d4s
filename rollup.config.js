const svelte = require("rollup-plugin-svelte");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const serve = require("rollup-plugin-serve");
const html = require("rollup-plugin-bundle-html");
const typescript = require("rollup-plugin-typescript2");
const tscompile = require("typescript");
const { terser } = require("rollup-plugin-terser");
const livereload = require("rollup-plugin-livereload");
const copy = require("rollup-plugin-copy");

const isProd = process.env.NODE_ENV === "production";
const isDev = process.env.NODE_ENV === "development";

const plugins = [
  commonjs({ include: "node_modules/**", exclude: ['node_modules/d3*/**'] }),
  typescript({ typescript: tscompile, clean: true }),
  svelte({
    dev: isProd ? false : true,
    extensions: [".svelte"],
    css: (css) => css.write("build/css/style.css", !isProd),
    preprocess: require('./svelte.config.js').preprocess
  }),
  resolve({
    mainFields: ['module', 'browser', 'main']
  }),
  html({
    template: "src/index.html",
    dest: "build",
    filename: "index.html"
  }),
  copy({
    targets: [
      { src: 'src/logo.svg', dest: 'build/' }
    ]
  })
];

if (isDev) {
  plugins.push(
    serve({
      open: false,
      host: '0.0.0.0',
      openPage: "/index.html",
      historyApiFallback: "/index.html",
      contentBase: ["./build"]
    }),
    livereload({
      watch: "build"
    })
  );
} else if (isProd) {
  plugins.push(terser({ sourcemap: false }));
}

module.exports = {
  input: "src/index.ts",
  output: {
    sourcemap: !isProd,
    name: "main",
    file: "build/js/main.js",
    format: "iife"
  },
  plugins
};
