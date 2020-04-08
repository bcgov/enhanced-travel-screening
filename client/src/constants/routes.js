export default Object.freeze({
  Base: '/',
  Login: '/login',
  Lookup: '/lookup',
  Confirmation: '/confirmation',
  RenderPDF: {
    staticRoute: '/renderpdf/:id/:jwt',
    dynamicRoute: (id, jwt) => `/lookup/${id}/${jwt}`,
  },
  LookupResults: {
    staticRoute: '/lookup/:id',
    dynamicRoute: (id) => `/lookup/${id}`,
  },
});
