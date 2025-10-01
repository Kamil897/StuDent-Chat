// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import s from "./Edit.module.scss";

// const EditProfile = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     avatar: "",
//     avatarBorders: "",
//   });

//   const navigate = useNavigate();
//   const { t } = useTranslation();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const user = localStorage.getItem("user");

//     if (!token || !user) {
//       navigate("/login");
//     } else {
//       setFormData(JSON.parse(user));
//     }
//   }, [navigate]);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSaveChanges = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch("http://localhost:3000/auth/update-profile", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });
  
//       if (!res.ok) throw new Error("Failed to update profile");
//       const updatedUser = await res.json();
  
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//       alert(t("alertSaved"));
//       navigate("/MainPage");
//     } catch (err) {
//       console.error(err);
//       alert("Ошибка при сохранении");
//     }
//   };
  
  
  

//   return (
//     <div className="container__main">
//       <div className={s.div}>
//         <h2 className={s.h2}>{t("editTitle")}</h2>

//         <form
//           onSubmit={(e) => {
//             e.preventDefault();
//             handleSaveChanges();
//           }}
//         >
//           <div className={s.img}>
//             <label htmlFor="avatar" className={s.imageUpload}>
//               <img
//                 src={formData.avatar || "profileimg.png"}
//                 alt="Avatar"
//                 className={s.uploadImage}
//               />
//             </label>
//             <input
//               type="file"
//               id="avatar"
//               name="avatar"
//               accept="image/*"
//               className={s.hiddenInput}
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file) {
//                   const reader = new FileReader();
//                   reader.onload = () => {
//                     setFormData({
//                       ...formData,
//                       avatar: reader.result,
//                     });
//                   };
//                   reader.readAsDataURL(file);
//                 }
//               }}
//             />
//           </div>

//           <div className={s.form}>
//             <div>
//               <label htmlFor="name">{t("labels.name")}</label>
//               <input
//                 className={s.input}
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name || ""}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <label htmlFor="email">{t("labels.email")}</label>
//               <input
//                 className={s.input}
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email || ""}
//                 onChange={handleChange}
//               />
//             </div>
//             <div>
//               <label htmlFor="avatarBorders">{t("labels.avatarBorders")}</label>
//               <select
//                 id="avatarBorders"
//                 name="avatarBorders"
//                 className={s.input}
//                 value={formData.avatarBorders || ""}
//                 onChange={handleChange}
//               >
//                 <option value="">{t("avatarBorderOptions.none")}</option>
//                 <option value="rounded">{t("avatarBorderOptions.rounded")}</option>
//                 <option value="circle">{t("avatarBorderOptions.circle")}</option>
//                 <option value="bordered">{t("avatarBorderOptions.bordered")}</option>
//               </select>
//             </div>
//           </div>
//           <button className={s.btn} type="submit">
//             {t("saveChanges")}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditProfile;
