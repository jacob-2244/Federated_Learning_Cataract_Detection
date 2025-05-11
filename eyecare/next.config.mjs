/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;




// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     async headers() {
//       return [
//         {
//           source: '/(.*)',
//           headers: [
//             {
//               key: 'Content-Security-Policy',
//               value: 
//                 "default-src 'self'; " +
//                 "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; " +
//                 "style-src 'self' 'unsafe-inline'; " +
//                 "img-src 'self' data: blob:; " +
//                 "font-src 'self'; " +
//                 "connect-src 'self'; " +
//                 "media-src 'self'; " +
//                 "object-src 'none'; " +
//                 "frame-src 'none'; " +
//                 "base-uri 'self'; " +
//                 "form-action 'self';"
//             }
//           ]
//         }
//       ]
//     }
//   }
  
//   module.exports = nextConfig
