import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const loadUserData = () => {
    try {
      const savedUser = localStorage.getItem("userData");
      const parsedUser = savedUser ? JSON.parse(savedUser) : {};

      return {
        points: parsedUser.points ?? 5000,
        purchasedItems: Array.isArray(parsedUser.purchasedItems)
          ? parsedUser.purchasedItems
          : [],
        ...parsedUser,
      };
    } catch (error) {
      console.error("Ошибка при загрузке данных пользователя из localStorage:", error);
      return { points: 5000, purchasedItems: [] };
    }
  };

  const [user, setUser] = useState(loadUserData());

  useEffect(() => {
    localStorage.setItem("userData", JSON.stringify(user));
  }, [user]);

  // ✅ Accept productId here!
  const spendPoints = (amount, productId) => {
    if (user.points >= amount && !user.purchasedItems.includes(productId)) {
      const updatedUser = {
        ...user,
        points: user.points - amount,
        purchasedItems: [...user.purchasedItems, productId],
      };
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  const removePurchasedItem = (itemId) => {
    setUser((prevUser) => ({
      ...prevUser,
      purchasedItems: prevUser.purchasedItems.filter((id) => id !== itemId),
    }));
  };

  const addPoints = (points) => {
    setUser((prevUser) => ({
      ...prevUser,
      points: prevUser.points + points,
    }));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        spendPoints,
        removePurchasedItem,
        addPoints,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
