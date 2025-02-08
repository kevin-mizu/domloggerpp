const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

module.exports = {
    mode: "production",
    entry: "./src/index.js",
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_debugger: false // keep debbugger;
                    }
                }
            })
        ]
    },
    output: {
        filename: "domloggerpp-bundle.js",
        path: path.resolve(__dirname, "../src"),
    },
};
