import React, { useState, useEffect } from 'react';
import styles from './Wallet.module.scss';

const Wallet = () => {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [balanceRes, transactionsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/wallet/balance', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/wallet/transactions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/wallet/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    const symbols = {
      coins: '🪙',
      crystals: '💎',
      points: '⭐',
      karmaPoints: '🌟'
    };

    return `${symbols[currency] || ''} ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: '📥',
      withdraw: '📤',
      transfer: '🔄',
      reward: '🎁'
    };
    return icons[type] || '💰';
  };

  const getTransactionColor = (type) => {
    const colors = {
      deposit: '#4CAF50',
      withdraw: '#f44336',
      transfer: '#2196F3',
      reward: '#FF9800'
    };
    return colors[type] || '#666';
  };

  if (loading) {
    return (
      <div className={styles['wallet-container']}>
        <div className={styles.loading}>Загрузка кошелька...</div>
      </div>
    );
  }

  return (
    <div className={styles['wallet-container']}>
      <div className={styles['wallet-header']}>
        <h2>💰 Кошелек</h2>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'balance' ? styles.active : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          Баланс
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'transactions' ? styles.active : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          История
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Статистика
        </button>
      </div>

      {activeTab === 'balance' && balance && (
        <div className={styles['balance-section']}>
          <div className={styles['balance-cards']}>
            <div className={`${styles['balance-card']} ${styles.coins}`}>
              <div className={styles['balance-icon']}>🪙</div>
              <div className={styles['balance-info']}>
                <h3>Монеты</h3>
                <p className={styles['balance-amount']}>{balance.coins.toLocaleString()}</p>
              </div>
            </div>
            <div className={`${styles['balance-card']} ${styles.crystals}`}>
              <div className={styles['balance-icon']}>💎</div>
              <div className={styles['balance-info']}>
                <h3>Кристаллы</h3>
                <p className={styles['balance-amount']}>{balance.crystals.toLocaleString()}</p>
              </div>
            </div>
            <div className={`${styles['balance-card']} ${styles.karma}`}>
              <div className={styles['balance-icon']}>🌟</div>
              <div className={styles['balance-info']}>
                <h3>Баллы</h3>
                <p className={styles['balance-amount']}>{balance.karmaPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className={styles['transactions-section']}>
          <h3>История транзакций</h3>
          {transactions.length === 0 ? (
            <div className={styles['empty-state']}>
              <p>Нет транзакций</p>
            </div>
          ) : (
            <div className={styles['transactions-list']}>
              {transactions.map((transaction) => (
                <div key={transaction.id} className={styles['transaction-item']}>
                  <div
                    className={styles['transaction-icon']}
                    style={{ color: getTransactionColor(transaction.type) }}
                  >
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className={styles['transaction-info']}>
                    <div className={styles['transaction-details']}>
                      <span className={styles['transaction-type']}>
                        {transaction.type === 'deposit' && 'Пополнение'}
                        {transaction.type === 'withdraw' && 'Списание'}
                        {transaction.type === 'transfer' && 'Перевод'}
                        {transaction.type === 'reward' && 'Награда'}
                      </span>
                      {transaction.source && (
                        <span className={styles['transaction-source']}>
                          ({transaction.source})
                        </span>
                      )}
                    </div>
                    <span className={styles['transaction-date']}>
                      {formatDate(transaction.createdAt)}
                    </span>
                  </div>
                  <div className={styles['transaction-amount']}>
                    <span
                      className={`${styles.amount} ${
                        transaction.type === 'withdraw' ? styles.negative : styles.positive
                      }`}
                    >
                      {transaction.type === 'withdraw' ? '-' : '+'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && stats && (
        <div className={styles['stats-section']}>
          <h3>Статистика</h3>
          <div className={styles['stats-grid']}>
            <div className={styles['stat-card']}>
              <h4>Всего транзакций</h4>
              <p className={styles['stat-value']}>{stats.transactionCount}</p>
            </div>
            <div className={styles['stat-card']}>
              <h4>Пополнения</h4>
              <div className={styles['stat-breakdown']}>
                <p>Монеты: {formatCurrency(stats.totalDeposits.coins, 'coins')}</p>
                <p>Кристаллы: {formatCurrency(stats.totalDeposits.crystals, 'crystals')}</p>
              </div>
            </div>
            <div className={styles['stat-card']}>
              <h4>Списания</h4>
              <div className={styles['stat-breakdown']}>
                <p>Монеты: {formatCurrency(stats.totalWithdrawals.coins, 'coins')}</p>
                <p>Кристаллы: {formatCurrency(stats.totalWithdrawals.crystals, 'crystals')}</p>
              </div>
            </div>
            <div className={styles['stat-card']}>
              <h4>Переводы</h4>
              <div className={styles['stat-breakdown']}>
                <p>Монеты: {formatCurrency(stats.totalTransfers.coins, 'coins')}</p>
                <p>Кристаллы: {formatCurrency(stats.totalTransfers.crystals, 'crystals')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
