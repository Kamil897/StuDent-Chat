import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import s from "./Tabs.module.scss";
import { useTranslation } from "react-i18next";

const Tabs = () => {
  const { t } = useTranslation();
  const tabs = [
    {
      id: 1,
      title: t("actions.mentor.title"),
      content: t("actions.mentor.content"),
    },
    {
      id: 2,
      title: t("actions.support.title"),
      content: t("actions.support.content"),
    },
    {
      id: 3,
      title: t("actions.learn.title"),
      content: t("actions.learn.content"),
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className={s.tabsContainer}>
      <div className={s.tabsHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? `${s.tab} ${s.activeTab}` : s.tab}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.title}
            {activeTab === tab.id && <motion.div layoutId="underline" className={s.underline} />}
          </button>
        ))}
      </div>
      <div className={s.tabContentWrapper}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={s.tabContent}
          >
            {tabs.find((tab) => tab.id === activeTab)?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tabs;
