const DRAFT_KEY = "claimDraftV1";

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Не удалось прочитать черновик:", error);
    return null;
  }
}

export function saveDraft(form) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form }));
  } catch (error) {
    console.warn("Не удалось сохранить черновик:", error);
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    console.warn("Не удалось удалить черновик:", error);
  }
}