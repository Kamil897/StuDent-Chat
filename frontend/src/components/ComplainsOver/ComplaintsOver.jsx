import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import s from "./ComplaintsOver.module.scss";
import { FaExclamation } from "react-icons/fa";
import { addNotification, NOTIFICATION_MESSAGES } from "../utils/notifications";

export default function ComplaintsOver({ onSubmit }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const formRef = useRef(null);
  // блокируем прокрутку боди, когда открыт модал
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  // закрытие по Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // автофокус в текстовую область
  useEffect(() => {
    if (open && textareaRef.current) textareaRef.current.focus();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      
      // Получаем токен из localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage("Ошибка: необходимо войти в систему");
        return;
      }

      // Отправляем жалобу на сервер
      const response = await fetch('http://localhost:3000/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: `${data.category}: ${data.description}`
        })
      });

      if (response.ok) {
        setMessage("Жалоба успешно отправлена!");
        onSubmit?.(data);
        
        // Добавляем уведомление
        addNotification(NOTIFICATION_MESSAGES.COMPLAINT_SENT, 'success');
      
        setTimeout(() => {
          formRef.current?.reset(); // ✅ безопасный сброс
          setOpen(false);
        }, 1500);
      }
       else {
        const errorData = await response.json();
        setMessage(`Ошибка: ${errorData.message || 'Не удалось отправить жалобу'}`);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setMessage("Ошибка сети: не удалось отправить жалобу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className={s.complainBtn} type="button" onClick={() => setOpen(true)}>
      <FaExclamation />

      </button>

      {open &&
        ReactDOM.createPortal(
          <div
            className={s.overlay}
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-title"
            onMouseDown={(e) => {
              // клик по фону (а не по содержимому) — закрыть
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <div className={s.modal} onMouseDown={(e) => e.stopPropagation()}>
              <div className={s.header}>
                <h2 id="complaint-title">Отправить жалобу</h2>
                <button
                  className={s.iconClose}
                  type="button"
                  aria-label="Закрыть"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>

              {message && (
                <div className={s.message} style={{ 
                  padding: '10px', 
                  margin: '10px 0', 
                  borderRadius: '4px',
                  backgroundColor: message.includes('успешно') ? '#d4edda' : '#f8d7da',
                  color: message.includes('успешно') ? '#155724' : '#721c24',
                  border: `1px solid ${message.includes('успешно') ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                  {message}
                </div>
              )}

              <form ref={formRef} className={s.form} onSubmit={handleSubmit}>
                <label className={s.field}>
                  <span className={s.label}>Категория</span>
                  <select name="category" className={s.input} defaultValue="abuse" required>
                    <option value="abuse">Оскорбления/токсичность</option>
                    <option value="spam">Спам</option>
                    <option value="copyright">Нарушение авторских прав</option>
                    <option value="other">Другое</option>
                  </select>
                </label>

                <label className={s.field}>
                  <span className={s.label}>Описание</span>
                  <textarea
                    name="description"
                    className={`${s.input} ${s.textarea}`}
                    placeholder="Опишите проблему…"
                    rows={5}
                    ref={textareaRef}
                    required
                  />
                </label>

                <div className={s.actions}>
                  <button type="button" className={s.secondary} onClick={() => setOpen(false)}>
                    Отмена
                  </button>
                  <button type="submit" className={s.primary} disabled={loading}>
                    {loading ? 'Отправка...' : 'Отправить'}
                  </button>
                </div>
              </form>

            </div>
          </div>,
          document.body
        )}
    </>
  );
}
