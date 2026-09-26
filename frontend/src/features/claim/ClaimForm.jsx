import { useEffect, useMemo, useState } from "react";
import {
  getMaxUser,
  enableClosingConfirmation,
  disableClosingConfirmation,
} from "../../max/bridge";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ВСЕ поля формы живут здесь. Изменился контракт — правишь здесь.
const initialForm = {
  platform: "Wildberries", // или "Ozon"
  penalty_type: "",
  amount: "",
  violation_date: "",
  act_number: "",
  warehouse_name: "",
  sku_id: "",
};

// ЕДИНСТВЕННОЕ место, где собирается объект для отправки.
function buildPayload(form, userId, photoUrls) {
  const isWB = form.platform === "Wildberries";

  return {
    platform: form.platform,
    penalty_type: form.penalty_type,

    // 1. Обязательные поля (ядро)
    user_id: userId,
    amount: Number(form.amount),
    violation_date: form.violation_date,
    photos: photoUrls,

    // 2. Опциональные поля (зависят от маркетплейса)
    act_number: form.act_number.trim() !== "" ? form.act_number : null,
    warehouse_name:
      isWB && form.warehouse_name.trim() !== "" ? form.warehouse_name : null,
    sku_id: !isWB && form.sku_id.trim() !== "" ? form.sku_id : null,
  };
}

// Claim-Score: обязательное ядро + своё обязательное поле для каждой платформы
function calcClaimScore(form, photoUrls) {
  const isWB = form.platform === "Wildberries";

  const checks = [
    form.penalty_type !== "",
    Number(form.amount) > 0,
    form.violation_date !== "",
    photoUrls.length > 0,
    isWB ? form.warehouse_name.trim() !== "" : form.sku_id.trim() !== "",
  ];

  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function ClaimForm() {
  const [form, setForm] = useState(initialForm);
  const [photos, setPhotos] = useState([]);        // файлы (для превью)
  const [photoUrls, setPhotoUrls] = useState([]);  // строки, которые поедут в JSON
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
  getMaxUser()
    .then(setUser)
    .catch(() => {
      setUser({
        id: "local-user",
        name: "Тестовый пользователь",
      });
    });
}, []);

  const score = useMemo(
    () => calcClaimScore(form, photoUrls),
    [form, photoUrls]
  );

  const isWB = form.platform === "Wildberries";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);

    // ЗАГЛУШКА. Потом здесь будет либо загрузка на бэкенд (FormData),
    // либо base64, либо URL из MAX — как договоритесь.
    setPhotoUrls(files.map((f, i) => `mock://photo-${i + 1}-${f.name}`));
  };

  const handleSubmit = async () => {
    if (score < 100) {
      setStatus("incomplete");
      return;
    }

    setStatus("loading");

    const payload = buildPayload(form, user ? user.id : null, photoUrls);

    try {
      if (USE_MOCK) {
        console.log("MOCK SEND:", payload);
        await new Promise((r) => setTimeout(r, 800));
        setStatus("success");
        return;
      }

      // Вот так отправляется JSON (а не FormData):
      const response = await fetch(`${API_URL}/api/v1/claims/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "claim.pdf";
      link.click();
      URL.revokeObjectURL(url);

      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 16 }}>
      <h1>Антикризисный помощник</h1>
      <h2>Создание претензии</h2>

      <div style={{ marginBottom: 16 }}>
        <div>Заполненность заявки: {score}%</div>
        <progress value={score} max={100} style={{ width: "100%" }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Платформа
          <select
            name="platform"
            value={form.platform}
            onChange={handleChange}
            style={{ width: "100%" }}
          >
            <option value="Wildberries">Wildberries</option>
            <option value="Ozon">Ozon</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Тип штрафа
          <select
            name="penalty_type"
            value={form.penalty_type}
            onChange={handleChange}
            style={{ width: "100%" }}
          >
            <option value="">Выбери тип</option>
            <option value="penalty_size">Штраф за габариты</option>
            <option value="late_shipment">Нарушение сроков поставки</option>
            <option value="return_issue">Спорный возврат</option>
            <option value="other">Другое</option>
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Сумма штрафа, руб.
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="15000"
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Дата нарушения
          <input
            type="date"
            name="violation_date"
            value={form.violation_date}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      {/* Обязательное только для WB */}
      {isWB && (
        <div style={{ marginBottom: 12 }}>
          <label>
            Склад (обязательно для WB)
            <input
              type="text"
              name="warehouse_name"
              value={form.warehouse_name}
              onChange={handleChange}
              placeholder="Коледино"
              style={{ width: "100%" }}
            />
          </label>
        </div>
      )}

      {/* Обязательно только для Ozon */}
      {!isWB && (
        <div style={{ marginBottom: 12 }}>
          <label>
            SKU (обязательно для Ozon)
            <input
              type="text"
              name="sku_id"
              value={form.sku_id}
              onChange={handleChange}
              placeholder="123456789"
              style={{ width: "100%" }}
            />
          </label>
        </div>
      )}

      {/* Опционально всегда */}
      <div style={{ marginBottom: 12 }}>
        <label>
          Номер акта (если есть)
          <input
            type="text"
            name="act_number"
            value={form.act_number}
            onChange={handleChange}
            placeholder="АКТ-991"
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Фото-доказательства
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleFiles}
          />
        </label>
        {photos.length > 0 && (
          <div style={{ marginTop: 8 }}>Загружено фото: {photos.length}</div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={status === "loading"}
        style={{ padding: "10px 16px", width: "100%" }}
      >
        {status === "loading" ? "Генерируем..." : "Сгенерировать претензию"}
      </button>

      {status === "incomplete" && (
        <p style={{ color: "orange" }}>
          Заполни обязательные поля и добавь хотя бы одно фото.
        </p>
      )}
      {status === "success" && (
        <p style={{ color: "green" }}>Заявка отправлена (мок — смотри консоль).</p>
      )}
      {status === "error" && (
        <p style={{ color: "red" }}>Ошибка отправки. Смотри консоль.</p>
      )}
    </div>
  );
}