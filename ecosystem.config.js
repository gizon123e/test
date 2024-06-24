module.exports = {
    apps: [
      {
        name: 'Backend SuperApps',
        exec_mode: 'cluster',
        instances: 'max',
        script: './app.js',
        max_memory_restart: "500M",
        out_file: "./outbe.log",
        error_file: "./errorbe.log",
        log_date_format: "DD-MM HH:mm:ss Z",
        log_type: "json",
        watch: true,
        watch_delay: 3000,
        ignore_watch: [
            "./node_modules",
            "./app/views",
            "./public",
            "./.DS_Store",
            "./package.json",
            "./yarn.lock",
            "./samples",
            "./src"
        ],
      }
    ]
  }