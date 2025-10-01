import { useEffect, useState } from "react";

const languages = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "uz", label: "UZ" },
];

const GoogleTranslateButton = () => {
  const [selectedLang, setSelectedLang] = useState("ru");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Подключаем Google Translate
    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "ru",
          autoDisplay: false,
        },
        "google_translate_hidden"
      );
    };

    // ВСТАВКА СТИЛЕЙ ДЛЯ СКРЫТИЯ ВСПЛЫВАЮЩИХ ЭЛЕМЕНТОВ
    const style = document.createElement("style");
    style.innerHTML = `
    body {
      top: 0px !important;
    }
  
    .goog-te-banner-frame.skiptranslate,
    .goog-te-balloon-frame,
    .goog-tooltip,
    .goog-tooltip:hover,
    #goog-gt-tt,
    .goog-te-menu-frame,
    .goog-te-gadget-simple,
    .goog-te-gadget-icon,
    .goog-te-gadget {
      display: none !important;
    }
  
    .goog-text-highlight,
    span[style*="background-color: rgb(255, 255, 0)"],
    span[style*="background-color: yellow"],
    span[style*="box-shadow"] {
      background-color: transparent !important;
      box-shadow: none !important;
      color: inherit !important;
    }
  
    .VIpgJd-ZVi9od-l4eHX-hSRGPd,
    .VIpgJd-ZVi9od-ORHb-OEVmcd {
      display: none !important;
    }
  `;
  
  
    document.head.appendChild(style);
  }, []);

  const changeLang = (code) => {
    setSelectedLang(code);
    setOpen(false);

    const select = document.querySelector("select.goog-te-combo");
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          ...mainBtn,
          backgroundColor: open ? "#4A5568" : "#2D3748",
        }}
        className="notranslate"
        data-no-translate="true"
      >
        🌍 {selectedLang.toUpperCase()}
      </button>

      <div
        style={{
          ...dropdown,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0px)" : "translateY(-10px)",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {languages
          .filter((lang) => lang.code !== selectedLang)
          .map((lang) => (
            <div
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              style={dropdownItem}
              className="notranslate"
              data-no-translate="true"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2D3748";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {lang.label}
            </div>
          ))}
      </div>

      <div id="google_translate_hidden" style={{ display: "none" }}></div>
    </div>
  );
};

const mainBtn = {
  marginLeft: "30px",
  padding: "8px 16px",
  fontSize: "15px",
  borderRadius: "8px",
  backgroundColor: "#2D3748",
  color: "#F7FAFC",
  border: "1px solid #4A5568",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

const dropdown = {
  position: "absolute",
  top: "50px",
  left: "30px",
  backgroundColor: "#1A202C",
  border: "1px solid #4A5568",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  zIndex: 1000,
  minWidth: "80px",
  overflow: "hidden",
  transition: "opacity 0.3s ease, transform 0.3s ease",
};

const dropdownItem = {
  padding: "10px 14px",
  fontSize: "14px",
  color: "#E2E8F0",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

export default GoogleTranslateButton;
