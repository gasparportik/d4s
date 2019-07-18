const { sass } = require('svelte-preprocess-sass');
const {
  preprocess,
  createEnv,
  readConfigFile
} = require("@pyoner/svelte-ts-preprocess");

const isProd = process.env.NODE_ENV === "production";
const isDev = process.env.NODE_ENV === "development";
const env = createEnv();

module.exports = {
  dev: isProd ? false : true,
  extensions: [".svelte"],
  css: (css) => css.write("build/css/style.css", !isProd),
  preprocess: {
    style: sass({}, { name: 'scss' }),
    ...preprocess({
      env,
      compilerOptions: {
        ...readConfigFile(env),
        allowNonTsExtensions: true
      }
    })
  }
};
