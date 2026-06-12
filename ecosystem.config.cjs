module.exports = {
  apps: [{
    name: 'agy-refresh',
    script: './pm2-wrapper.cjs',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    watch: ['src'],
    watch_delay: 1000,
    ignore_watch: ['node_modules', 'logs', '.git'],
    max_memory_restart: '256M',
    restart_delay: 3000,
    max_restarts: 10,
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
