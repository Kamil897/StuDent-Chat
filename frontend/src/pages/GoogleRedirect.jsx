// import React from 'react';
// import { GoogleLogin } from '@react-oauth/google';
// import { useNavigate } from 'react-router-dom';
// import jwt_decode from 'jwt-decode';
// import api from '../utils/axios';

// const GoogleRedirect = () => {
//   const navigate = useNavigate();

//   const handleSuccess = async (credentialResponse) => {
//     try {
//       const { credential } = credentialResponse;
//       const decoded = jwt_decode(credential);

//       const res = await api.post('/auth/google/redirect', {
//         email: decoded.email,
//         name: decoded.name,
//         picture: decoded.picture,
//         sub: decoded.sub, // Google ID
//       });

//       // Всё прошло успешно — редиректим
//       navigate('/MainPage');
//     } catch (err) {
//       console.error('Ошибка Google входа:', err);
//       alert('Не удалось войти через Google');
//     }
//   };

//   return (
//     <div style={{ marginTop: '20px', textAlign: 'center' }}>
//       <GoogleLogin
//         onSuccess={handleSuccess}
//         onError={() => alert('Ошибка входа через Google')}
//         useOneTap
//       />
//     </div>
//   );
// };

// export default GoogleRedirect;
