import s from "./HomeHero.module.scss";
import React, { useState, useEffect, useRef } from "react";
import SpotlightCard from "../SpotlightCard/SpotlightCard.jsx";
import Tabs from "../Tabs/Tabs.jsx";
import TextCursor from "../TextCursor/TextCursor.jsx";
import { useTranslation } from "react-i18next";
import { FaRobot, FaLightbulb, FaBookOpen, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import ComplaintsOver from "../ComplainsOver/ComplaintsOver.jsx";
import DarkVeil from "../DarkVeil/DarkVeil.jsx";
import Shuffle from "../ShuffleText/ShuffleText.jsx";

const HomeHero = () => {
    const tooltipRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        const handleMouseMove = (event) => {
            const tooltip = tooltipRef.current;
            if (!tooltip) return;

            const tooltipRect = tooltip.getBoundingClientRect();
            const positionX =
                ((event.clientX - tooltipRect.left) / tooltipRect.width) * 100;
            const positionY =
                ((event.clientY - tooltipRect.top) / tooltipRect.height) * 100;

            tooltip.style.setProperty("--position-x", `${positionX}%`);
            tooltip.style.setProperty("--position-y", `${positionY}%`);
        };

        const tooltip = tooltipRef.current;
        if (tooltip) {
            tooltip.addEventListener("mousemove", handleMouseMove);
        }

        return () => {
            if (tooltip) {
                tooltip.removeEventListener("mousemove", handleMouseMove);
            }
        };
    }, []);


    const steps = [
        {
          icon: <FaRobot />,
          title: "1. Открой ИИ-помощника",
          description: "Перейди на страницу помощника и выбери нужную категорию: задания, тесты, объяснение тем и т.д.",
        },
        {
          icon: <FaLightbulb />,
          title: "2. Сформулируй запрос",
          description: "Напиши чёткий и конкретный вопрос. Например: «Объясни, что такое производная» или «Помоги решить уравнение».",
        },
        {
          icon: <FaBookOpen />,
          title: "3. Получи ответ и учись",
          description: "ИИ даст объяснение, решение или пошаговую инструкцию. Используй ответ как материал для изучения, а не как готовую шпаргалку.",
        },
        {
          icon: <FaCheck />,
          title: "4. Применяй знания",
          description: "После получения ответа — проверь себя, повтори материал, задай дополнительные вопросы.",
        },
        {
          icon: <FaExclamationTriangle />,
          title: "5. Используй ИИ правильно",
          description: "ИИ — это учебный помощник. Не используй его для списывания или обмана. Он создан, чтобы помогать тебе понимать и учиться.",
        },
      ];
    return (
        <>
            <section className={s.welcome_section}>
            <Shuffle
                text="STUDENT CHAT"
                shuffleDirection="right"
                duration={0.35}
                animationMode="evenodd"
                shuffleTimes={1}
                ease="power3.out"
                stagger={0.03}
                threshold={0.1}
                triggerOnce={true}
                triggerOnHover={true}
                respectReducedMotion={true}
                />
            </section>
            <section className={s.active} id="section-О нас">
                <div className={s.home_wrapper}>
                    <div className={s.text}>
                    <h2 className={s.home_title}>{t("about.title")}</h2>
                    <p className={s.home_text}>{t("about.description")}</p>
                    </div>
                  
              
                    <img src="/about_us.png" alt="" />
                </div>
            </section>
            <section className={s.spotlight__cards}>
                <h1 style={{
                        textAlign: "start",
                        color: "#4c4c4c",
                        fontSize: "42px",
                        marginBottom: "60px",
                    }}>
                    {t("how_we_help.title")}
                </h1>

                <div className={s.sCards}>
                    <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                        <h2 className={s.item_title}>{t("how_we_help.sections.community.title")}</h2>
                        <p className={s.item_text}>{t("how_we_help.sections.community.content")}</p>
                    </SpotlightCard>

                    <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                        <h2 className={s.item_title}>{t("how_we_help.sections.flexibility.title")}</h2>
                        <p className={s.item_text}>{t("how_we_help.sections.flexibility.content")}</p>
                    </SpotlightCard>

                    <SpotlightCard className="custom-spotlight-card" spotlightColor="rgba(0, 229, 255, 0.2)">
                        <h2 className={s.item_title}>{t("how_we_help.sections.skills.title")}</h2>
                        <p className={s.item_text}>{t("how_we_help.sections.skills.content")}</p>
                    </SpotlightCard>
                </div>
            </section>
            <section className={s.our_users}>
                <h1 className={s.our_users_title} id="section-Почему выбирают нас">
                    {t("why_us.title")}
                </h1>

                <div className={s.content_our}>
                    <div className={`${s.item} ${s.item_big}`}>
                    <img className={s.item_img_big} src="/chart.png" alt="График" />
                    <h2 className={s.item_text_desc}>{t("why_us.reasons.availability.title")}</h2>
                    <p className={s.item_text_decor}>{t("why_us.reasons.availability.content")}</p>
                    </div>

                    <div className={`${s.item} ${s.item_small_top}`}>
                    <img className={s.item_img} src="/house.png" alt="Дом" />
                    <div className={s.text_block}>
                        <h2 className={s.item_text_desc}>{t("why_us.reasons.safe_space.title")}</h2>
                        <p className={s.item_text_decor}>{t("why_us.reasons.safe_space.content")}</p>
                    </div>
                    </div>

                    <div className={`${s.item} ${s.item_small_bottom}`}>
                    <img className={s.item_img} src="/laptop.png" alt="Ноутбук" />
                    <div className={s.text_block}>
                        <h2 className={s.item_text_desc}>{t("why_us.reasons.mentors.title")}</h2>
                        <p className={s.item_text_decor}>{t("why_us.reasons.mentors.content")}</p>
                    </div>
                    </div>

                </div>
            </section>
            <section className={s.AI_usage}>
                <div className={s.container_usage}>
                    <h1 className={s.title_usage}>{t("ai_usage.title")}</h1>
                    <div className={s.steps}>
                    {steps.map((step, index) => (
                        <div
                        key={index}
                        className={s.step}
                        data-step={`0${index + 1}`} 
                        >
                        <h2 className={s.stepTitle}>
                            {t(`ai_usage.steps.${index}.title`)}
                        </h2>
                        <p className={s.description_usage}>
                            {t(`ai_usage.steps.${index}.description`)}
                        </p>
                        </div>
                    ))}
                    </div>

                    <p className={s.note}>{t("ai_usage.note")}</p>
                </div>
            </section>
            <section className={s.complaints_section}>
                <ComplaintsOver />
            </section>
        </>
    );
};

export default HomeHero;
