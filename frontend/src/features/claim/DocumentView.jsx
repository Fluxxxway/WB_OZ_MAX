import { PENALTY_OPTIONS } from "./ClaimForm";

export default function DocumentView({ claim, status, onEdit, onGenerate }) {
  const { form, photoUrls, userName } = claim;

  const penaltyLabel =
    (PENALTY_OPTIONS.find((o) => o.value === form.penalty_type) || {}).label ||
    form.penalty_type;

  const amount = Number(form.amount).toLocaleString("ru-RU");
  const violationDate = new Date(form.violation_date).toLocaleDateString("ru-RU");
  const today = new Date().toLocaleDateString("ru-RU");

  return (
    <div style={{ padding: 16, background: "#eceff1", minHeight: "100vh" }}>
      {/* Лист документа */}
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
          lineHeight: 1.55,
          fontSize: 14,
        }}
      >
        <p style={{ textAlign: "right", margin: 0 }}>
          Кому: ООО «Вайлдберриз»
          <br />
          От: {userName}
        </p>

        <h2 style={{ textAlign: "center", marginTop: 16 }}>
          ДОСУДЕБНАЯ ПРЕТЕНЗИЯ
        </h2>
        <p style={{ textAlign: "center", margin: 0 }}>
          о неправомерном удержании денежных средств
        </p>

        <p>
          {violationDate} в отношении моего товара было применено удержание:
          «{penaltyLabel}» на сумму {amount} руб.
        </p>

        {form.warehouse_name && (
          <p>Склад отгрузки: {form.warehouse_name}.</p>
        )}
        {form.act_number && <p>Акт платформы: {form.act_number}.</p>}

        <p>
          Считаю данное удержание необоснованным по следующим причинам:{" "}
          {form.description || "описание ситуации"}.
        </p>

        {/* ЗАГЛУШКА: позже текст пункта оферты приезжает из каталога бэкенда
            (вопрос №4 в сообщении бэкендеру) */}
        <p>
          <b>Правовое основание:</b> п. 12.4 Регламента оферты WB — порядок
          применения удержаний и процедура их оспаривания.
        </p>

        <p>
          <b>Требую:</b> снять удержание в размере {amount} руб. и вернуть
          денежные средства в течение 10 календарных дней.
        </p>

        <p style={{ marginBottom: 4 }}>
          <b>Приложения (фотодоказательства):</b>
        </p>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {photoUrls.map((url, i) => (
            <li key={i}>Фотодоказательство № {i + 1}</li>
          ))}
        </ol>

        <p style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
          <span>{today}</span>
          <span>{userName}</span>
        </p>
      </div>

      {/* Кнопки внизу ленты, как в макете */}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={onEdit}
          disabled={status === "loading"}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #999", background: "#fff" }}
        >
          Редактировать
        </button>
        <button
          onClick={onGenerate}
          disabled={status === "loading"}
          style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "#2e7d32", color: "#fff" }}
        >
          {status === "loading" ? "Создаём файл..." : "Создать файл"}
        </button>
      </div>

      {status === "error" && (
        <p style={{ color: "#c62828", marginTop: 8 }}>
          Не удалось создать файл. Проверьте соединение и попробуйте ещё раз.
        </p>
      )}
    </div>
  );
}