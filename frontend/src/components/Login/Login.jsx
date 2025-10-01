import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import s from "./Login.module.scss";
import { useTranslation } from "react-i18next";

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // ⚡ Отправляем POST на NestJS
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/login`,
                { email, password }
            );

            // В ответе у тебя приходит { access_token, user }
            localStorage.setItem("token", res.data.access_token);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            alert(t("login.success") || "Kirish muvaffaqiyatli!");
            navigate("/MainPage");
        } catch (error) {
            console.error("Login error:", error);
            alert(t("login.incorrect") || "Email yoki parol noto‘g‘ri");
        }
    };

    return (
        <div className="container__main">
            <div className={s.formWrapper}>
                <h2 className={s.title}>
                    {t("login.title") || "Tizimga kirish"}
                </h2>
                <form onSubmit={handleLogin} className={s.form}>
                    <div className={s.flexColumn}>
                        <label htmlFor="email">
                            {t("login.email") || "Email"}
                        </label>
                    </div>
                    <div className={s.inputForm}>
                        <input
                            className={s.input}
                            type="email"
                            id="email"
                            placeholder={
                                t("login.email_placeholder") || "Email kiriting"
                            }
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={s.flexColumn}>
                        <label htmlFor="password">
                            {t("login.password") || "Parol"}
                        </label>
                    </div>
                    <div className={s.inputForm}>
                        <input
                            className={s.input}
                            type="password"
                            id="password"
                            placeholder={
                                t("login.password_placeholder") ||
                                "Parolingizni kiriting"
                            }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className={s.button} type="submit">
                        {t("login.login_button") || "Kirish"}
                    </button>

                    <p className={s.text}>
                        {t("login.no_account") || "Hisobingiz yo‘qmi?"}{" "}
                        <Link className={s.link} to="/register">
                            {t("login.register_link") || "Ro‘yxatdan o‘tish"}
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
