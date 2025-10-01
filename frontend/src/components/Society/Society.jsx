import React, { useState } from "react";
import s from "./Society.module.scss";
import { motion, AnimatePresence } from 'framer-motion';
import FlowingMenu from '../FlowingMenu/FlowingMenu.jsx';
import LikeButton from '../../LikeButton/LikeButton';
import Switch from '../../Switch/Switch';
import Share from '../../Share/Share';
import { useTranslation } from 'react-i18next';

const Society = () => {
  const { t } = useTranslation();

  const demoItems = [
    { link: 'https://wiut.uz/', text: 'WestMinister', image: 'https://www.gazeta.uz/media/img/2018/07/BFudA815330117401691_b.jpg' },
  ];

  const educationData = [
    {
      id: 1,
      title: t("society.news1.title"),
      content: t("society.news1.content"),
    },
    {
      id: 2,
      title: t("society.news2.title"),
      content: t("society.news2.content"),
    },
    {
      id: 3,
      title: t("society.news3.title"),
      content: t("society.news3.content"),
    },
  ];

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [like, setLike] = useState(1752);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLike = () => {
    setLiked(!liked);
    setLike(prev => liked ? prev - 1 : prev + 1);
  };

  const toggleSave = () => setSaved(!saved);

  const shareToSocialMedia = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text} ${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}&summary=${text}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  return (
    <>
      <div className={s.newsPage}>
        <h1 className={s.title}>{t("society.title")}</h1>
        <div className={s.newsList}>
          {educationData.map((item) => (
            <div key={item.id} className={s.newsItem}>
              <h2 className={s.newsTitle}>{item.title}</h2>
              <p className={s.newsContent}>{item.content}</p>

              <div className={s.likes}>
                <LikeButton count={like} onToggle={(state) => {
                  setLiked(state);
                  setLike(prev => state ? prev + 1 : prev - 1);
                }} />
                <Switch active={saved} onToggle={(state) => setSaved(state)} />
                <Share
                  active={showShareOptions}
                  onToggle={() => setShowShareOptions(prev => !prev)}
                  onPlatformSelect={shareToSocialMedia}
                />
              </div>

              <AnimatePresence>
                {showShareOptions && (
                  <motion.div
                    className={s.shareOptions}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button onClick={() => shareToSocialMedia('facebook')}>Facebook</button>
                    <button onClick={() => shareToSocialMedia('twitter')}>Twitter</button>
                    <button onClick={() => shareToSocialMedia('whatsapp')}>WhatsApp</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: '180px', position: 'relative', marginTop: '50px' }}>
        <FlowingMenu items={demoItems} />
      </div>
    </>
  );
};

export default Society;
