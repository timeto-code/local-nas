module.exports = {
  app: [
    {
      name: 'local-nas',
      script: 'npm',
      args: ['start'],
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
