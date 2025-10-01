import React, { useState } from 'react';
import s from './TeacherCard.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFlag, FaGlobeAmericas, FaGlobeEurope, FaGlobe } from "react-icons/fa";
import { FaTelegram, FaInstagram, FaLinkedin } from "react-icons/fa";
import { useTranslation } from 'react-i18next'; // ✅

const TeacherCard = ({ name, languages, subjects }) => {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation(); // ✅

  const getIcon = (langName) => {
    switch (langName.toLowerCase()) {
      case "русский":
        return <FaFlag style={{ color: "#e74c3c" }} />;
      case "английский":
        return <FaGlobeAmericas style={{ color: "#3498db" }} />;
      case "французский":
        return <FaGlobeEurope style={{ color: "#9b59b6" }} />;
      case "немецкий":
        return <FaGlobe style={{ color: "#f1c40f" }} />;
      default:
        return <FaGlobe style={{ color: "#bdc3c7" }} />;
    }
  };

  return (
    <>
    <div className={s.card}>
      <div className={s.inner}>
        <div className={s.front}>
          <div className={s.teacher__img__div}>
            <img className={s.teacher__img} src="/snake.png" alt={name} />
          </div>
          <h3 className={s.teacher__name}>{name}</h3>
        </div>

        <div className={s.back}>
          <div className={s.teacher__card__text}>
            {languages.map((lang) => (
              <h4 key={lang}>
                {getIcon(lang)} {t("teachers_card.teaches")} <span>{t(`teachers_hero.${lang}`)}</span>
              </h4>
            ))}

            {subjects.length > 0 && (
              <div className={s.subjects}>
                {subjects.map((subj) => (
                  <h4 key={subj}>📘 {t(`subjects.${subj}`)}</h4>
                ))}
              </div>
            )}

            <p className={s.card__text}>
              {t('teachers_card.bio')}
            </p>

            <button className={s.socialsBtn} onClick={() => setShowModal(true)}>
              {t('teachers_card.contacts')}
            </button>
          </div>
        </div>


    </div>
    </div>
    
    {/* Вынесено наружу, чтобы не отражалось */}
    <AnimatePresence>
          {showModal && (
            <motion.div className={s.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className={s.modal} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.3 }}>
                <h2>{t('teachers_card.socials')}</h2>
                <div className={s.socialIcons}>
                  <a href="#"><FaTelegram /></a>
                  <a href="#"><FaInstagram /></a>
                  <a href="#"><FaLinkedin /></a>
                </div>
                <button className={s.closeBtn} onClick={() => setShowModal(false)}>
                  {t('teachers_card.close')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
  );
};

export default TeacherCard;
  