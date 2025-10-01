import React, { useState } from "react";
import s from "../Society/Society.module.scss";
import { motion, AnimatePresence } from 'framer-motion';
import FlowingMenu from '../FlowingMenu/FlowingMenu.jsx';
import LikeButton from '../../LikeButton/LikeButton';
import Switch from '../../Switch/Switch';
import Share from '../../Share/Share';
import { useTranslation } from 'react-i18next';

const Tech = () => {
  const { t } = useTranslation();

  const educationNewsData = [
    {
      id: 1,
      title: t('edu.title1'),
      content: t('edu.content1'),
    },
    {
      id: 2,
      title: t('edu.title2'),
      content: t('edu.content2'),
    },
    {
      id: 3,
      title: t('edu.title3'),
      content: t('edu.content3'),
    }
  ];

  const demoItems = [
    { link: 'https://uzb.mgimo.ru/contacts', text: 'MGIMO', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvLpGgo5KSTAxe95PLSdASTX3TWpYPWWehYw&s' },
  ];

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [like, setLike] = useState(1752);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLike = () => {
    if (liked) setLike(like - 1);
    else setLike(like + 1);
    setLiked(!liked);
  };

  const toggleSave = () => setSaved(!saved);

  const shareToSocialMedia = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(t('edu.shareText'));

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
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareOptions(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('edu.shareTitle'),
        text: t('edu.shareText'),
        url: window.location.href,
      });
    } else {
      alert(t('edu.notSupported'));
    }
  };

  return (
    <>
      <div className={s.newsPage}>
        <h1 className={s.title}>{t('edu.heading')}</h1>
        <div className={s.newsList}>
          {educationNewsData.map((news) => (
            <div key={news.id} className={s.newsItem}>
              <h2 className={s.newsTitle}>{news.title}</h2>
              <p className={s.newsContent}>{news.content}</p>
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

export default Tech;
