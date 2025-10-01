import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Shop from "../components/Shop/Shop";
import s from "./Magaz.module.scss";
import { Link } from "react-router-dom";

const API_MAIN = "http://localhost:7777/shop";
const API_LOGIN = "http://localhost:3000";

const Magaz = () => {
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [user, setUser] = useState({ points: 0, purchased: [] });
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [notification, setNotification] = useState(null);

  // Загружаем товары и данные юзера
  useEffect(() => {
    const loadData = async () => {
      try {
        // Товары — backend-main
        const productsRes = await fetch(`${API_MAIN}/products`);
        const productsData = await productsRes.json();
        setProducts(productsData);

        // Пользователь — backend-login
        const token = localStorage.getItem("token");
        if (token) {
          const userRes = await fetch(`${API_LOGIN}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userData = await userRes.json();
          setUser({
            id: userData.id,
            points: userData.karmaPoints || 0,
            purchased: (userData.purchasedItems || []).map(item => item.id)
          });          
        }
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      }
    };

    loadData();
  }, []);

  const handleBuy = async (product) => {
  setLoadingProductId(product.id);

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      showNotification("❌ Нет токена авторизации", "error");
      return;
    }

    // 1. Покупка товара — backend-main
    const res = await fetch(`${API_MAIN}/user/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user.id, productId: product.id }),
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Сразу добавляем в purchased на фронте
      setUser((prev) => ({
        ...prev,
        points: data.points ?? prev.points, // если backend возвращает баланс
        purchased: Array.from(new Set([...(prev.purchased || []), product.id])),
      }));

      // 2. Обновляем баланс и покупки из backend-login
      const userRes = await fetch(`${API_LOGIN}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setUser({
        id: userData.id,
        points: userData.karmaPoints || 0,
        purchased: (userData.purchasedItems || []).map(item => item.id)      
      });

      // 3. Записываем покупку в историю (backend-login)
      try {
        await fetch(`${API_LOGIN}/purchase-history/record`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productName: t(product.name),
            amount: product.price,
            currency: "points",
            quantity: 1,
            totalCost: product.price,
            source: "shop",
          }),
        });
      } catch (error) {
        console.error("Ошибка записи истории:", error);
      }

      showNotification(`✅ ${t(product.name)} ${t("shop.success")}`, "success");
    } else {
      // ⚡️ Обрабатываем случай повторной покупки
      if (data.message === "Product already purchased" || data.error === "Product already purchased") {
        setUser((prev) => ({
          ...prev,
          purchased: Array.from(new Set([...(prev.purchased || []), product.id])),
        }));
        showNotification(`✅ ${t(product.name)} ${t("shop.success")}`, "success");
        return;
      }

      showNotification(data.error || t("shop.insufficientFunds"), "error");
    }
  } catch (error) {
    console.error("Ошибка покупки:", error);
    showNotification("❌ Ошибка при покупке", "error");
  } finally {
    setLoadingProductId(null);
  }
};


  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const affordableCount = products.filter((p) => user.points >= p.price).length;

  const filteredProducts = products
    .filter((product) => {
      if (filter === "affordable") return user.points >= product.price;
      if (filter === "unaffordable") return user.points < product.price;
      if (filter === "purchased") return user.purchased.includes(product.id);
      return true;
    })
    .filter((product) => {
      if (!searchQuery) return true;
      return (
        (t(product.name) || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t(product.description) || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return t(a.name).localeCompare(t(b.name));
        case "rarity":
          const order = { common: 1, rare: 2, legendary: 3 };
          return order[b.rarity] - order[a.rarity];
        default:
          return 0;
      }
    });

  const getTotalValue = () => {
    return products
      .filter((p) => user.purchased.includes(p.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <div className={s.container}>
      {notification && (
        <div className={`${s.notification} ${s[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <header className={s.header}>
        <div className={s.titleSection}>
          <h1 className={s.title}>{t("shop.title")}</h1>
          <p className={s.subtitle}>
            {t("shop.available", { count: affordableCount, total: products.length })}
          </p>
        </div>

        <div className={s.userInfo}>
          <div className={s.balance}>
            <span className={s.balanceLabel}>{t("shop.balance")}</span>
            <span className={s.balanceAmount}>{user.points.toLocaleString()}</span>
          </div>

          <Link to="/Points">
            <button className={s.Pointsbtn}>{t("shop.buypoints")}</button>
          </Link>

          {user.purchased.length > 0 && (
            <div className={s.purchaseInfo}>
              <span className={s.purchaseLabel}>{t("shop.spent")}</span>
              <span className={s.purchaseAmount}>{getTotalValue().toLocaleString()}</span>
            </div>
          )}
        </div>
      </header>

      <div className={s.controls}>
        <div className={s.searchSection}>
          <input
            type="text"
            placeholder={t("shop.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={s.searchInput}
          />
        </div>

        <div className={s.filtersSection}>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>{t("shop.filter")}</label>
            <div className={s.filters}>
              <button className={filter === "all" ? s.active : ""} onClick={() => setFilter("all")}>
                {t("shop.all", { count: products.length })}
              </button>
              <button className={filter === "affordable" ? s.active : ""} onClick={() => setFilter("affordable")}>
                {t("shop.affordable", { count: affordableCount })}
              </button>
              <button className={filter === "unaffordable" ? s.active : ""} onClick={() => setFilter("unaffordable")}>
                {t("shop.unaffordable", { count: products.length - affordableCount })}
              </button>
              <button className={filter === "purchased" ? s.active : ""} onClick={() => setFilter("purchased")}>
                {t("shop.purchased", { count: user.purchased.length })}
              </button>
            </div>
          </div>

          <div className={s.sortGroup}>
            <label className={s.sortLabel}>{t("shop.sort")}</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={s.sortSelect}>
              <option value="name">{t("shop.sortName")}</option>
              <option value="price-low">{t("shop.sortLow")}</option>
              <option value="price-high">{t("shop.sortHigh")}</option>
              <option value="rarity">{t("shop.sortRarity")}</option>
            </select>
          </div>
        </div>
      </div>

      <div className={s.productGrid}>
        {filteredProducts.length === 0 ? (
          <div className={s.emptyState}>
            <div className={s.emptyIcon}>🛍️</div>
            <h3 className={s.emptyTitle}>{t("shop.empty")}</h3>
            <p className={s.emptyDescription}>
              {searchQuery ? t("shop.emptySearch", { query: searchQuery }) : t("shop.emptyCategory")}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className={s.clearSearch}>
                {t("shop.clearSearch")}
              </button>
            )}
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isPurchased = user.purchased.includes(product.id);
            const canAfford = user.points >= product.price;
            const isLoading = loadingProductId === product.id;

            return (
              <div key={product.id} className={s.productWrapper}>
                {product.rarity === "legendary" && <div className={s.rarityBadge}>✨ {t("shop.legendary")}</div>}
                {product.rarity === "rare" && <div className={s.rarityBadge}>💎 {t("shop.rare")}</div>}

                <Shop
                  prefix={product}
                  onBuy={() => handleBuy(product)}
                  disabled={!canAfford || isPurchased || isLoading}
                  isPurchased={isPurchased}
                  canAfford={canAfford}
                />
              </div>
            );
          })
        )}
      </div>

      {user.purchased.length > 0 && (
        <div className={s.statistics}>
          <h3 className={s.statsTitle}>{t("shop.statsTitle")}</h3>
          <div className={s.statsGrid}>
            <div className={s.statItem}>
              <span className={s.statValue}>{user.purchased.length}</span>
              <span className={s.statLabel}>{t("shop.statsPurchased")}</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statValue}>{getTotalValue().toLocaleString()}</span>
              <span className={s.statLabel}>{t("shop.statsSpent")}</span>
            </div>
            <div className={s.statItem}>
              <span className={s.statValue}>
                {Math.round((user.purchased.length / products.length) * 100)}%
              </span>
              <span className={s.statLabel}>{t("shop.statsCollection")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Magaz;
