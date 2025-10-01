import React, { useEffect, useState } from "react";
import s from "./PointsShop.module.css";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { recordPurchase } from "../components/utils/gamesApi";

// Базовые урлы
const API_MAIN = "http://localhost:7777/shop";   // backend-main
const API_LOGIN = "http://localhost:3000";       // backend-login

const pointPackages = [
    { id: 1, amount: 500, label: "500 Points (Free)", free: true },
    { id: 2, amount: 1000, label: "1000 Points" },
    { id: 3, amount: 2500, label: "2500 Points" },
    { id: 4, amount: 5000, label: "5000 Points" },
];

const PointsShop = () => {
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const { t } = useTranslation(); 

    // Получаем текущие очки (backend-login)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_LOGIN}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await res.json();
                setPoints(data.karmaPoints || 0);
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Бесплатные очки (backend-login)
    const addFreePoints = async (amount) => {
        setMessage("");
        try {
            const res = await fetch(`${API_LOGIN}/auth/add-points`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ points: amount }),
            });

            const data = await res.json();
            if (res.ok) {
                setPoints(data.karmaPoints);
                
                // Записываем покупку в историю (backend-login)
                try {
                    await recordPurchase({
                        productName: `${amount} Points (Free)`,
                        amount: amount,
                        currency: 'points',
                        quantity: 1,
                        totalCost: 0,
                        source: 'points_shop'
                    });
                } catch (error) {
                    console.error('Error recording purchase:', error);
                }
                
                setMessage(`✅ You received ${amount} points!`);
            } else {
                setMessage(`❌ ${data.error}`);
            }
        } catch (err) {
            console.error("Error adding points:", err);
            setMessage("❌ Failed to add points.");
        }
    };

    // Покупка через Stripe (backend-main)
    const buyWithStripe = async (pkg) => {
        setMessage("");
        try {
            const res = await fetch(`${API_MAIN}/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: pkg.id }),
            });

            const data = await res.json();
            if (res.ok && data.url) {
                window.location.href = data.url; // Переход на Stripe Checkout
            } else {
                setMessage(`❌ ${data.error || "Payment failed"}`);
            }
        } catch (err) {
            console.error("Error creating checkout session:", err);
            setMessage("❌ Failed to start payment.");
        }
    };

    if (loading) {
        return <div className={s.loading}>Loading points...</div>;
    }

    return (
        <div className={s.container}>

            <Link to='/Shop'>
                <button className={s.buyBtn}>{t('games.back')}</button>
            </Link>

            <h1 className={s.title}>Buy Points</h1>

            <div className={s.points}>
                Your Points: <span>{points}</span>
            </div>

            {message && <div className={s.message}>{message}</div>}

            <div className={s.grid}>
                {pointPackages.map((pkg) => (
                    <div key={pkg.id} className={s.card}>
                        <h3>{pkg.label}</h3>
                        <p className={s.amount}>+{pkg.amount} pts</p>
                        <button
                            className={s.buyBtn}
                            onClick={() =>
                                pkg.free
                                    ? addFreePoints(pkg.amount)
                                    : buyWithStripe(pkg)
                            }
                        >
                            {pkg.free ? "Claim Free" : "Buy"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PointsShop;
