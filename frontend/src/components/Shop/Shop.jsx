import React, { useState } from "react";
import { useUser } from "../../Context/UserContext";
import s from "./Shop.module.scss";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Shop = ({ prefix, onBuy, disabled, isPurchased, canAfford }) => {
  const { user } = useUser();
  const { t } = useTranslation();

  return (
    <div className={s.prefixCard}>
      <div className={s.cardHeader}>
        <img src={prefix.image} alt={t(prefix.name)} className={s.cardPhoto} />
        <h2>{t(prefix.name)}</h2>
        <p>{t(prefix.description)}</p>
      </div>
      <div className={s.cardBody}>
        <button
          className={s.buyButton}
          disabled={disabled}
          onClick={onBuy}
        >
          {isPurchased ? t("shop_2.purchasedLabel") : t("shop_2.buy")}
          <svg className={s.svgIcon} width="18px" height="18px" viewBox="0 0 576 512">
            <path d="M512 80c8.8 0 16 7.2 16 16v32H48V96c0-8.8 7.2-16 16-16H512zm16 
              144V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V224H528zM64 32C28.7 32
              0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7
              -64-64-64H64zm56 304c-13.3 0-24 10.7-24 24s10.7 24 24 24h48c13.3 0 24-10.7 24-24s
              10.7-24-24-24H120zm128 0c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24H248z">
            </path>
          </svg>
        </button>
        <Link to={`/product/${prefix.id}`} className={s.noUnderline}>
          <button className={s.buyButtonExtra}>
            {t("shop_2.details")}
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Shop;
