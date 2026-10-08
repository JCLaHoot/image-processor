// import restart from 'vite-plugin-restart'

export default {
    root: './src/', // Sources files (typically where index.html is)
    appType: 'spa',
    publicDir: '../static/', // Path from "root" to static assets (files that are served as they are)
    server:
    {
        host: true, // Open to local network and display URL
        open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
    },
    base: '/', // Use absolute paths for assets
    build:
    {
        outDir: '../docs', // Output in the docs/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: false // No Sourcemaps in production
    },
    plugins:
    [
        // restart({ restart: [ '../static/**', ] }), // Restart server on static file change

    ],
}