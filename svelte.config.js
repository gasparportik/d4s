const { sass } = require('svelte-preprocess-sass');
const {
  preprocess,
  createEnv,
  readConfigFile
} = require("@pyoner/svelte-ts-preprocess");

const env = createEnv();

module.exports = {
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
