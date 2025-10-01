// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const GoogleSuccess = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const url = new URL(window.location.href);
//     const token = url.searchParams.get('token');

//     if (token) {
//       const decoded = JSON.parse(atob(token.split('.')[1]));
//       localStorage.setItem('access_token', token);
//       localStorage.setItem('role', decoded.role);
//       localStorage.setItem('userId', decoded.sub);
//       navigate('/MainPage');
//     } else {
//       alert('Ошибка Google авторизации');
//       navigate('/login');
//     }
//   }, []);

//   return <div>Вход через Google...</div>;
// };

// export default GoogleSuccess;
