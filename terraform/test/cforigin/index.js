// lambda@edge S3 Origin Response trigger to add security headers

const XFrameOptions = [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }];
const HSTS = [{ key: 'Strict-Transport-Security', value: 'max-age=15768001; includeSubdomains; preload' }];
const XContentTypeOptions = [{ key: 'X-Content-Type-Options', value: 'nosniff' }]
const ReferrerPolicy = [{ key: 'Referrer-Policy', value: 'same-origin' }];
const XSSProtection = [{ key: 'X-XSS-Protection', value: '1; mode=block' }]


exports.handler = (event, context, callback) => {
  // extract the response object
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  // add headers
  headers['x-frame-options'] = XFrameOptions;
  headers['strict-transport-security'] = HSTS;
  headers['x-content-type-options'] = XContentTypeOptions;
  headers['referrer-policy'] = ReferrerPolicy;
  headers['x-xss-protection'] = XSSProtection;

  const trustedSourcesFonts = [
    "fonts.googleapis.com",
    "fonts.gstatic.com"
  ];

  const trustedSourcesHttps = [
  ];

  const trustedSourcesFontsString = trustedSourcesFonts.join(' ');
  const trustedSourcesHttpsString = trustedSourcesHttps.join(' ');


  // script-src  'self' 'unsafe-eval' 'unsafe-inline'; --> Webapp uses eval() and inline js
  const contentSecurityPolicy = [
    `base-uri 'self'`,
    `prefetch-src 'self'`,
    `object-src 'none'`,
    `frame-ancestors 'none'`,
    `style-src 'self' 'unsafe-inline' ${trustedSourcesFontsString}`,
    `font-src 'self' ${trustedSourcesFontsString}`,
    `connect-src 'self' ${trustedSourcesHttpsString}`,
    `img-src 'self' ${trustedSourcesHttpsString} data: blob:`,
    `default-src 'self' ${trustedSourcesHttpsString}`,
    `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${trustedSourcesHttpsString}`,
  ].join('; ')

  headers['content-security-policy'] = [{ key: 'Content-Security-Policy', value: contentSecurityPolicy }];

  return callback(null, response); // return control to CloudFront
};
