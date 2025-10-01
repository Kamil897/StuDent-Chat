import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import s from "./Registration.module.scss";
import { useTranslation } from "react-i18next";

const Registration = () => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        hobby: "",
        education: "",
        name: "",
        password: "",
        avatar: "",
        birth: "",
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
  e.preventDefault();

  let calculatedAge = null;
  if (formData.birth) {
    const birthDate = new Date(formData.birth);
    const today = new Date();
    calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
  }

  try {
    await axios.post("/auth/register", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        username: formData.name,  // если нужен логин отдельно
        age: calculatedAge,
        hobby: formData.hobby,
        education: formData.education,
        avatar: formData.avatar,
      });
      

    alert(t("register.success") || "Ro‘yxatdan o‘tish muvaffaqiyatli!");
    navigate("/login");
  } catch (error) {
    console.error("Registration error:", error);
    if (error.response?.status === 409) {
      alert(
        t("register.already_exists") ||
          "Bu foydalanuvchi allaqachon mavjud!"
      );
    } else {
      alert(t("register.server_error") || "Serverda xatolik yuz berdi");
    }
  }
};


    return (
        <form className={s.form} onSubmit={handleRegister}>
            <div className={s.img}>
                <label htmlFor="avatar" className={s.imageUpload}>
                    <img
                        src={formData.avatar || "profileimg.png"}
                        alt="avatar"
                        className={s.uploadImage}
                    />
                </label>
                <input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                                setFormData({
                                    ...formData,
                                    avatar: reader.result,
                                });
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                />
            </div>

            {[
                {
                    name: "firstName",
                    label: t("register.first_name"),
                    placeholder: t("register.enter_first_name"),
                },
                {
                    name: "lastName",
                    label: t("register.last_name"),
                    placeholder: t("register.enter_last_name"),
                },
                {
                    name: "email",
                    label: t("register.email"),
                    placeholder: t("register.enter_email"),
                    type: "email",
                },
                {
                    name: "hobby",
                    label: t("register.hobby"),
                    placeholder: t("register.enter_hobby"),
                },
                {
                    name: "education",
                    label: t("register.education"),
                    placeholder: t("register.enter_education"),
                },
                { name: "birth", label: t("register.birth"), type: "date" },
                {
                    name: "name",
                    label: t("register.username"),
                    placeholder: t("register.enter_username"),
                },
                {
                    name: "password",
                    label: t("register.password"),
                    placeholder: t("register.enter_password"),
                    type: "password",
                },
            ].map(({ name, label, placeholder, type = "text" }) => (
                <div key={name}>
                    <div className={s.flex_column}>
                        <label>{label}</label>
                    </div>
                    <div className={s.inputForm}>
                        <input
                            className={s.input}
                            placeholder={placeholder}
                            type={type}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            ))}

            <button className={s.button_submit} type="submit">
                {t("register.register_button") || "Ro‘yxatdan o‘tish"}
            </button>

            <p className={s.p}>
                {t("register.have_account")}{" "}
                <span className={s.span}>
                    <Link to="/login">
                        {t("register.login_link") || "Kirish"}
                    </Link>
                </span>
            </p>
        </form>
    );
};

export default Registration;
