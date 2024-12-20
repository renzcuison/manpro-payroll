const mix = require('laravel-mix');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/app.js', 'public/js')
    .react()
    .sass('resources/sass/app.scss', 'public/css')
    .version();

if (!mix.inProduction()) {
    mix.webpackConfig({
        devServer: {
            hot: true, // Enable Hot Module Replacement
            host: 'localhost', // Localhost for local development
            port: 8080, // Port for dev server (you can change this if needed)
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
            },
            client: {
                overlay: true, // Show error overlay in the browser
            },
        },
        plugins: [
            // Ensure React Fast Refresh is enabled for React components
            new ReactRefreshWebpackPlugin(),
        ],
    });
}
