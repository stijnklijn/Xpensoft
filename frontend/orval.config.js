module.exports = {
  api: {
    input: 'http://localhost:5200/openapi/v1.json',
    output: {
      target: 'src/app/api/generated',
      schemas: 'src/app/api/generated/models',
      client: 'angular',
      mode: 'tags',
      baseUrl: '/api',
    },
  },
};
