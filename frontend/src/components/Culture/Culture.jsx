import React, { useState } from "react";
import s from "../Society/Society.module.scss";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import FlowingMenu from '../FlowingMenu/FlowingMenu.jsx';
import LikeButton from '../../LikeButton/LikeButton';
import Switch from '../../Switch/Switch';
import Share from '../../Share/Share';

const Culture = () => {
  const { t } = useTranslation();
  const demoItems = [
    {
      link: 'https://inha.uz/ru/glavnaya/',
      text: 'INHA',
      image: 'https://inha.uz/wp-content/uploads/2021/01/The_panoramic_view_of_IUT-1536x612.jpg'
    },
  ];

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [like, setLike] = useState(1752);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLike = () => {
    setLike(prev => liked ? prev - 1 : prev + 1);
    setLiked(!liked);
  };

  const toggleSave = () => setSaved(!saved);

  const shareToSocialMedia = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Новость");

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

  const educationNewsData = t("educationNews", { returnObjects: true });

  return (
    <>
      <div className={s.newsPage}>
        <h1 className={s.title}>{t("educationTitle")}</h1>
        <div className={s.newsList}>
          {educationNewsData.map((educationNews, index) => (
            <div key={index} className={s.newsItem}>
              <h2 className={s.newsTitle}>{educationNews.title}</h2>
              <p className={s.newsContent}>{educationNews.content}</p>
              <div className={s.likes}>
                <LikeButton count={like} onToggle={toggleLike} />
                <Switch active={saved} onToggle={toggleSave} />
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

export default Culture;
