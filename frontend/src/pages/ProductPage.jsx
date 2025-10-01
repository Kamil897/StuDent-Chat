import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import s from "./ProductPage.module.scss";

const API_MAIN = "http://localhost:7777"; // backend-main
const API_LOGIN = "http://localhost:3000"; // backend-login

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [isBought, setIsBought] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ загрузка товара и пользователя
  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const authHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      try {
        // продукты с backend-main
        const resProducts = await fetch(`${API_MAIN}/shop/products`);
        if (!resProducts.ok) throw new Error("Failed to load products");
        const data = await resProducts.json();
        const list = Array.isArray(data) ? data : [];
        const found = list.find((p) => String(p.id) === String(id));
        setProduct(found || null);

        // пользователь с backend-login
        const resUser = await fetch(`${API_LOGIN}/auth/me`, {
          headers: authHeaders,
        });
        if (!resUser.ok) throw new Error(`${resUser.status} Unauthorized`);
        const me = await resUser.json();

        setUser({
          id: me.id,
          points: me.karmaPoints || 0,
          purchasedItems: me.purchasedItems || [],
        });

        if (me.purchasedItems?.some((item) => String(item.id) === String(id))) {
          setIsBought(true);
        }
      } catch (err) {
        console.error("Error loading product/user:", err);
        navigate("/login");
      }
    };

    load();
  }, [id, navigate]);

  // ✅ покупка
  const handleConfirmBuy = async () => {
    setIsLoading(true);
    setShowConfirmModal(false);

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_MAIN}/shop/user/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser({
          ...user,
          points: data.points,
          purchasedItems: data.purchasedItems,
        });
        setIsBought(true);
        alert(t("shop_items.success"));
        navigate("/bought");
      } else {
        alert(data.error || t("shop_items.fail"));
      }
    } catch (error) {
      console.error("Error buying product:", error);
      alert(t("shop_items.fail"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return <p>{t("loading")}...</p>;
  if (!user) return <p>{t("loading_user")}...</p>;

  return (
    <div className={s.container}>
      <div className={s.productCard}>
        <div className={s.detailsSection}>
          <h2 className={s.title}>{product.name}</h2>
          <p className={s.description}>{product.description}</p>
          <p className={s.priceSection}>
            {t("цена")}: {product.price} {t("points")}
            {user.points < product.price && (
              <span className={s.insufficientFunds}>
                {t("shop_items.not_enough")}
              </span>
            )}
          </p>
          <p>
            {t("ваш баланс")}: {user.points} {t("points")}
          </p>

          <div className={s.actions}>
            {isBought ? (
              <button className={s.disabledButton} disabled>
                {t("shop_items.already_bought")}
              </button>
            ) : (
              <button
                className={`${s.buyButton} ${
                  user.points < product.price ? s.cantAfford : ""
                }`}
                disabled={isLoading || user.points < product.price}
                onClick={() => setShowConfirmModal(true)}
              >
                {isLoading ? t("loading") : t("shop_items.buy")}
              </button>
            )}

            <button
              className={s.backButton}
              onClick={() => navigate("/shop")}
            >
              ← {t("назад")}
            </button>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className={s.modalOverlay}>
          <div className={s.modal}>
            <p className={s.modalText}>{t("Потверждения покупки")}</p>
            <div className={s.modalActions}>
              <button className={s.confirmButton} onClick={handleConfirmBuy}>
                {t("да")}
              </button>
              <button
                className={s.cancelButton}
                onClick={() => setShowConfirmModal(false)}
              >
                {t("нет")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
