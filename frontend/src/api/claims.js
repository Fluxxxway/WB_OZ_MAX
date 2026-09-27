const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// Поставь true, чтобы посмотреть экран ошибки на предпросмотре
export const SIMULATE_ERROR = false;

// Позже: мок-ветка удаляется, остаётся только fetch.
// Больше нигде в коде ничего менять не придётся.
export async function generateClaim(payload) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 900)); // имитация сети
    if (SIMULATE_ERROR) throw new Error("MOCK: сервер недоступен");
    return {
      claim_id: "mock-123",
      pdf_url: "https://example.com/claims/mock-123.pdf",
      mid: "mock-mid-1",
    };
  }

  const response = await fetch(`${API_URL}/api/v1/claims/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

  return response.json(); // ждём { claim_id, pdf_url, mid }
}
// Отправка PDF в чат. Позже — по ответу бэкендера (вопрос №3):
// либо эндпоинт бота, либо shareMaxContent({ mid }).
export async function sendClaimToChat(pdf) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true };
  }

  const response = await fetch(
    `${API_URL}/api/v1/claims/${pdf.claim_id}/send`,
    { method: "POST" }
  );
  if (!response.ok) throw new Error(`Ошибка отправки: ${response.status}`);
  return response.json();
}