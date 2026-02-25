// PM2 Configuration for Production Deployment
module.exports = {
  apps: [{
    name: 'seya-fashion-backend',
    script: 'server.js',
    instances: 1, // Can be increased based on server capacity
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Production optimizations
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Auto restart on crash
    autorestart: true,
    // Maximum number of restart attempts
    max_restarts: 10,
    // Minimum uptime before restart
    min_uptime: '10s',
    // Restart delay
    restart_delay: 4000,
    // Health check
    health_check_grace_period: 3000,
    // Environment variables from file
    env_file: '.env.production'
  }]
};