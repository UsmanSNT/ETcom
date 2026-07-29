module.exports = {
  apps: [
    {
      name: "ETcomp",
      cwd: "/var/www/ETcomp",
      script: "npm",
      args: "run start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
      out_file: "/var/www/ETcomp/logs/out.log",
      error_file: "/var/www/ETcomp/logs/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
