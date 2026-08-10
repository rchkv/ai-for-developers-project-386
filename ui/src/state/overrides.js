/**
 * Локальный оверлей поверх статического Prism-мока.
 *
 * Мок с фейковыми данными (см. scripts/generate-mock-openapi.mjs) не хранит
 * состояние между запросами: после POST /slots/{id}/book повторный
 * GET /slots всё равно вернёт исходные данные. Чтобы демо выглядело
 * реалистично, запоминаем изменения, сделанные в текущей сессии браузера,
 * и применяем их поверх ответов сервера при рендере списков.
 *
 * При работе с настоящим бэкендом (не Prism-моком) это просто становится
 * no-op слоем, который ничего не меняет, так как сервер сам возвращает
 * актуальные данные.
 */

const STORAGE_KEY = "calendar-booking-overrides";

function readState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    bookedSlotIds: [],
    deletedSlotIds: [],
    extraSlots: [],
    deletedEventIds: [],
    extraEvents: [],
    eventPatches: {},
  };
}

function writeState(state) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetOverrides() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function markSlotBooked(id) {
  const state = readState();
  if (!state.bookedSlotIds.includes(id)) state.bookedSlotIds.push(id);
  writeState(state);
}

export function addLocalSlot(slot) {
  const state = readState();
  state.extraSlots.push(slot);
  writeState(state);
}

export function markSlotDeleted(id) {
  const state = readState();
  if (!state.deletedSlotIds.includes(id)) state.deletedSlotIds.push(id);
  writeState(state);
}

export function applyToSlots(slots) {
  const state = readState();
  const merged = [...slots, ...state.extraSlots];
  return merged
    .filter((slot) => !state.deletedSlotIds.includes(slot.id))
    .map((slot) =>
      state.bookedSlotIds.includes(slot.id) ? { ...slot, is_available: false } : slot,
    );
}

export function addLocalEvent(event) {
  const state = readState();
  state.extraEvents.push(event);
  writeState(state);
}

export function markEventDeleted(id) {
  const state = readState();
  if (!state.deletedEventIds.includes(id)) state.deletedEventIds.push(id);
  writeState(state);
}

export function patchLocalEvent(id, patch) {
  const state = readState();
  state.eventPatches[id] = { ...(state.eventPatches[id] || {}), ...patch };
  writeState(state);
}

export function applyToEvents(events) {
  const state = readState();
  const merged = [...events, ...state.extraEvents];
  return merged
    .filter((event) => !state.deletedEventIds.includes(event.id))
    .map((event) => ({ ...event, ...(state.eventPatches[event.id] || {}) }));
}
