import { PLATFORM } from "../../config/platform";
import { useState } from "react";
import { openExternal } from "../../max/bridge";
import { sendClaimToChat } from "../../api/claims";

export default function FinalPage({ pdf }) {
  const [chatStatus, setChatStatus] = useState("idle"); // idle | loading | done | error

  const handleOpenBrowser = () => {
    openExternal(pdf.pdf_url);
  };

  const handleChat = async () => {
    setChatStatus("loading");
    try {
      await sendClaimToChat(pdf);
      setChatStatus("done");
    } catch (error) {
      console.error(error);
      setChatStatus("error");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 56 }}>✅</div>
      <h2>Файл создан</h2>
      <p style={{ color: "#666", fontSize: 13 }}>Номер претензии: {pdf.claim_id}</p>

      <button
        onClick={handleOpenBrowser}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          border: "1px solid #999",
          background: "#fff",
        }}
      >
        Открыть PDF в браузере
      </button>

      <button
        onClick={handleChat}
        disabled={chatStatus === "loading"}
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          border: "none",
          background: "#2e7d32",
          color: "#fff",
        }}
      >
        {chatStatus === "loading" ? "Отправляем..." : "Получить PDF в чат-бота MAX"}
      </button>

      {chatStatus === "done" && (
        <p style={{ color: "#2e7d32" }}>Файл уже в чате с ботом ↓</p>
      )}
      {chatStatus === "error" && (
        <p style={{ color: "#c62828" }}>Не удалось отправить в чат. Попробуй ещё раз.</p>
      )}

      <div
        style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          background: "#eceff1",
          fontSize: 13,
          textAlign: "left",
          lineHeight: 1.5,
        }}
      >
        <b>Что делать дальше:</b> сохрани полученный файл и прикрепи его к обращению — {PLATFORM.appealPath}
      </div>
    </div>
  );
}