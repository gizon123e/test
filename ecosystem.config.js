module.exports = {
    apps: [
      {
        name: 'Backend MBG Prod',
        exec_mode: 'cluster',
        instances: '2',
        script: './app.js',
        max_memory_restart: "500M",
        out_file: "./outbe_mbg_prod.log",
        error_file: "./errorbe_mbg_prod.log",
        log_date_format: "DD-MM HH:mm:ss Z",
        log_type: "json",
        exp_backoff_restart_delay: 100,
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