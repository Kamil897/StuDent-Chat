import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useUser } from "../Context/UserContext";
import s from "./BoughtPage.module.scss";
import { FaShoppingBag } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const Bought = () => {
  const { user, removePurchasedItem } = useUser();  
  const [sellingItem, setSellingItem] = useState(null);
  const [sellPrice, setSellPrice] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSell = (item) => {
    setSellingItem(item);
  };

  const confirmSell = () => {
    if (sellPrice && sellingItem) {
      removePurchasedItem(sellingItem.id);
      setSellingItem(null);
      setSellPrice("");
      alert(t("purchases.sold"));
    }
  };

  const safeItems = (user?.purchasedItems || []).filter(item => item?.id);

  return (
    <div className={s.container}>
      <header className={s.header}>
        <div className={s.headerTop}>
          <h1 className={s.title}>
            <FaShoppingBag /> {t('purchases.title')}
          </h1>
          <span className={s.balance}>💰 {user?.points || 0} {t('purchases.points')}</span>
        </div>
        <button className={s.backButton} onClick={() => navigate('/Shop')}>
          <svg height="16" width="16" viewBox="0 0 1024 1024">
            <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
          </svg>
          <span>{t('purchases.back')}</span>
        </button>
      </header>

      <section className={s.summaryBox}>
        <p><strong>{t('purchases.items')}:</strong> {safeItems.length}</p>
        <p><strong>{t('purchases.totalSpent')}:</strong> {safeItems.reduce((sum, item) => sum + (item.price || 0), 0)} €</p>
      </section>

      <div className={s.productGrid}>
        {safeItems.length > 0 ? (
          safeItems.map((item) => (
            <div key={item.id} className={s.purchasedItem}>
              {item.image && (
                <img src={item.image} alt={t(item.name)} className={s.itemImage} />
              )}
              <div className={s.infoBlock}>
                <h3 className={s.h}>{t(item.name)}</h3>
                <p className={s.h}>{t(item.description)}</p>
                <span className={s.price}>💰 {item.price} €</span>
              </div>
              <div className={s.actions}>
                <button
                  className={s.removeButton}
                  onClick={() => removePurchasedItem(item.id)}
                >
                  ❌ {t('purchases.remove')}
                </button>
                <button
                  className={s.sellButton}
                  onClick={() => handleSell(item)}
                >
                  💸 {t('purchases.sell')}
                </button>
              </div>
              {sellingItem?.id === item.id && (
                <div className={s.sellSection}>
                  <input
                    type="number"
                    placeholder={t('purchases.enterPrice')}
                    value={sellPrice}
                    onChange={(e) => setSellPrice(e.target.value)}
                  />
                  <button onClick={confirmSell}>{t('purchases.confirmSell')}</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={s.emptyState}>
            <p className={s.emptyText}>{t('purchases.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bought;
