export default function FinalPage({ pdf }) {
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>Файл создан ✅</h2>
      <p style={{ color: "#666", fontSize: 12 }}>claim_id: {pdf.claim_id}</p>
      <p style={{ color: "#666", fontSize: 12, wordBreak: "break-all" }}>
        {pdf.pdf_url}
      </p>
      <p style={{ color: "#999", fontSize: 12 }}>
        Кнопки «Открыть в браузере» и «Получить в чат» появятся на Этапе 2.
      </p>
    </div>
  );
}