import { useState } from "react";
import s from "./TeacherHero.module.scss";
import TeacherCard from "../TeacherCard/TeacherCard";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

const TeacherHero = () => {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const languages = [
    { id: "all", name: t("teachers_hero.all"), icon: "twemoji:globe-with-meridians" },
    { id: "russian", name: t("teachers_hero.russian"), icon: "twemoji:flag-russia" },
    { id: "english", name: t("teachers_hero.english"), icon: "twemoji:flag-united-kingdom" },
    { id: "german", name: t("teachers_hero.german"), icon: "twemoji:flag-germany" },
    { id: "french", name: t("teachers_hero.french"), icon: "twemoji:flag-france" },
  ];

  const teachers = [
    { id: 1, name: "Иван Иванов", teaches: ["russian"], subjects: ["math", "physics"] },
    { id: 2, name: "John Smith", teaches: ["english"], subjects: ["biology", "chemistry"] },
    { id: 3, name: "Hans Müller", teaches: ["german"], subjects: ["history", "math"] },
    { id: 4, name: "Jean Dupont", teaches: ["french"], subjects: ["literature", "biology"] },
    { id: 5, name: "Анна Петрова", teaches: ["russian", "english"], subjects: ["math"] },
    { id: 6, name: "Emma Johnson", teaches: ["english", "french"], subjects: ["physics", "chemistry"] },
  ];  

  const filteredTeachers =
    selectedLanguage === "all"
      ? teachers
      : teachers.filter((teacher) => teacher.teaches.includes(selectedLanguage));

  return (
    <section className={s.teacher}>
      <div className={s.container__main}>
        <div className={s.teacher__wrapper}>
          {/* Языковая панель */}
          <div className={s.teacher__languages}>
            <h2>{t("footer.teachers")}</h2>
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`${s.language__link} ${
                  selectedLanguage === lang.id ? s.active : ""
                }`}
              >
                <Icon
                  icon={lang.icon}
                  width="24"
                  height="24"
                  style={{ marginRight: "8px", verticalAlign: "middle", minWidth: "26px", minHeight: "26px"}}
                />
                {lang.name}
              </button>
            ))}
          </div>

          {/* Карточки преподавателей */}
          <div className={s.teacher__cards}>
            {filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <div key={teacher.id} className={s.fadeIn}>
                  <TeacherCard
                    name={teacher.name}
                    languages={teacher.teaches}
                    subjects={teacher.subjects}
                  />
                </div>
              ))
            ) : (
              <p className={s.noResults}>{t("teachers_hero.no_results")}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeacherHero;
