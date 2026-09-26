import { useMemo, useState } from "react";

const initialForm = {
  platform: "Wildberries",
  penalty_type: "",
  amount: "",
  violation_date: "",
  description: "",
  act_number: "",
  warehouse_name: "",
  sku_id: "",
};

export const PENALTY_OPTIONS = [
  { value: "penalty_size", label: "Удержание за несоответствие габаритов" },
  { value: "late_shipment", label: "Нарушение сроков поставки" },
  { value: "return_issue", label: "Спорный возврат" },
  { value: "other", label: "Другое удержание" },
];

function buildPayload(form, userId, photoUrls) {
  const isWB = form.platform === "Wildberries";

  return {
    platform: form.platform,
    penalty_type: form.penalty_type,
    user_id: userId,
    amount: Number(form.amount),
    violation_date: form.violation_date,
    photos: photoUrls,
    act_number: form.act_number.trim() !== "" ? form.act_number : null,
    warehouse_name:
      isWB && form.warehouse_name.trim() !== "" ? form.warehouse_name : null,
    sku_id: !isWB && form.sku_id.trim() !== "" ? form.sku_id : null,
  };
}

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

export default function ClaimForm({ initial = null, user, onPreview }) {
  const [form, setForm] = useState(initial ? initial.form : initialForm);
  const [photos, setPhotos] = useState(initial ? initial.photos : []);
  const [photoUrls, setPhotoUrls] = useState(initial ? initial.photoUrls : []);
  const [showHint, setShowHint] = useState(false);

  const score = useMemo(() => calcClaimScore(form, photoUrls), [form, photoUrls]);
  const isWB = form.platform === "Wildberries";
  const today = new Date().toISOString().slice(0, 10);

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "amount") {
    // оставляем только цифры, всё остальное просто не появляется
    const digits = value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, amount: digits }));
    return;
  }

  setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);
    // ЗАГЛУШКА: позже реальные URL (вопрос №1 бэкендеру)
    setPhotoUrls(files.map((f, i) => `mock://photo-${i + 1}-${f.name}`));
  };

  const handleSubmit = () => {
    if (score < 100) {
      setShowHint(true);
      return;
    }
    onPreview({
      form,
      photos,
      photoUrls,
      userName: user ? user.name : "Продавец",
      payload: buildPayload(form, user ? user.id : null, photoUrls),
    });
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 16 }}>
      <h1>Антикризисный помощник</h1>
      <h2>Данные для претензии</h2>

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
            {PENALTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Сумма удержания, руб.
          <input
            type="text"
            inputMode="numeric"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="15000"
            style={{ width: "100%" }}
          />
        </label>
        {form.amount !== "" && Number(form.amount) <= 0 && (
          <p style={{ color: "orange", fontSize: 12, margin: "4px 0 0" }}>
            Сумма должна быть больше нуля
          </p>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Дата начисления
          <input
            type="date"
            name="violation_date"
            value={form.violation_date}
            onChange={handleChange}
            max={today}
            style={{ width: "100%" }}
          />
        </label>
      </div>

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
          Описание ситуации
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Опиши ситуацию минимум 20 символами"
            rows={4}
            style={{ width: "100%" }}
          />
        </label>
        <div style={{ fontSize: 12, color: "#888" }}>
          {form.description.trim().length} / минимум 20 символов
        </div>
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
          <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
            {photos.map((file, i) => (
              <img
                key={i}
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        style={{ padding: "12px 16px", width: "100%", borderRadius: 8, border: "none", background: "#2e7d32", color: "#fff" }}
      >
        Предпросмотр апелляции
      </button>

      {showHint && score < 100 && (
        <p style={{ color: "orange" }}>
          Заполни обязательные поля и добавь хотя бы одно фото.
        </p>
      )}
    </div>
  );
}