#!/usr/bin/env node
/**
 * Generates a copy of the compiled OpenAPI spec with realistic static
 * `example` values injected into responses/request bodies, so that Prism
 * (`npm run mock`) returns believable fixtures instead of random
 * schema-based data.
 *
 * Fixtures are computed relative to "now" every time this script runs, so
 * the 14-day booking window described in requirements.md never goes stale.
 *
 * NOTE (mock limitation): Prism's static-example mode does not persist
 * state between requests, so booking/creating/deleting via the mock will
 * not actually change what a subsequent GET returns. The frontend (see
 * ui/src/state/overrides.js) compensates for this with a local overlay.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import YAML from "yaml";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sourcePath = path.join(rootDir, "tsp-output", "schema", "openapi.yaml");
const outDir = path.join(rootDir, "mock");
const outPath = path.join(outDir, "openapi.generated.yaml");

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildFixtures() {
  const owner = { id: "owner-1", name: "Иван Петров" };

  const events = [
    {
      id: "event-default",
      type: "default",
      description: "Быстрая встреча без уточнения формата",
      duration: 30,
    },
    {
      id: "event-meeting",
      type: "meeting",
      description: "Рабочая встреча по проекту",
      duration: 60,
    },
    {
      id: "event-consultation",
      type: "consultation",
      description: "Персональная консультация",
      duration: 45,
    },
  ];

  // Same daily time grid is shared by all event types, one event per
  // time slot, so no two events ever occupy the same moment in time.
  const dailyHours = [10, 11, 12, 14, 15, 16, 17];
  const today = startOfDay(new Date());
  const slots = [];

  for (let day = 0; day < 14; day += 1) {
    for (let i = 0; i < dailyHours.length; i += 1) {
      const event = events[(day + i) % events.length];
      const from = new Date(today.getTime() + day * DAY_MS);
      from.setHours(dailyHours[i], 0, 0, 0);
      const till = new Date(from.getTime() + event.duration * 60 * 1000);
      // Deterministically mark ~1 in 5 slots as already booked, so the UI
      // has something to show for the "no double booking" rule.
      const isAvailable = (day * dailyHours.length + i) % 5 !== 0;

      slots.push({
        id: `slot-${day}-${dailyHours[i]}`,
        owner_id: owner.id,
        event_id: event.id,
        from: from.toISOString(),
        till: till.toISOString(),
        is_available: isAvailable,
      });
    }
  }

  return { owner, events, slots };
}

function setIn(obj, pathSegments, value) {
  let node = obj;
  for (let i = 0; i < pathSegments.length - 1; i += 1) {
    const key = pathSegments[i];
    if (node[key] === undefined) return; // path doesn't exist in spec, skip
    node = node[key];
  }
  const lastKey = pathSegments[pathSegments.length - 1];
  if (node === undefined) return;
  node[lastKey] = value;
}

function applyExamples(doc, fixtures) {
  const { owner, events, slots } = fixtures;
  const bookedSlot = { ...slots.find((s) => !s.is_available) };
  const freshSlot = { ...slots.find((s) => s.is_available) };

  const ex = [
    // Owners
    [["paths", "/owners", "get", "responses", "200", "content", "application/json", "example"], { items: [owner] }],
    [["paths", "/owners", "post", "requestBody", "content", "application/json", "example"], owner],
    [["paths", "/owners", "post", "responses", "200", "content", "application/json", "example"], owner],
    [["paths", "/owners/{id}", "get", "responses", "200", "content", "application/json", "example"], owner],
    [["paths", "/owners/{id}", "patch", "responses", "200", "content", "application/json", "example"], owner],

    // Events
    [["paths", "/events", "get", "responses", "200", "content", "application/json", "example"], { items: events }],
    [["paths", "/events", "post", "requestBody", "content", "application/json", "example"], events[0]],
    [["paths", "/events", "post", "responses", "200", "content", "application/json", "example"], events[0]],
    [["paths", "/events/{id}", "get", "responses", "200", "content", "application/json", "example"], events[0]],
    [["paths", "/events/{id}", "patch", "responses", "200", "content", "application/json", "example"], events[0]],

    // Slots
    [["paths", "/slots", "get", "responses", "200", "content", "application/json", "example"], { items: slots }],
    [["paths", "/slots", "post", "requestBody", "content", "application/json", "example"], freshSlot],
    [["paths", "/slots", "post", "responses", "200", "content", "application/json", "example"], freshSlot],
    [["paths", "/slots/{id}", "get", "responses", "200", "content", "application/json", "example"], freshSlot],
    [
      ["paths", "/slots/{id}/book", "post", "responses", "200", "content", "application/json", "example"],
      { ...bookedSlot, is_available: false },
    ],
  ];

  for (const [segments, value] of ex) {
    setIn(doc, segments, value);
  }
}

async function main() {
  const source = await readFile(sourcePath, "utf8").catch(() => {
    throw new Error(
      `Не найден ${sourcePath}. Сначала выполните "npm run compile" (npx tsp compile .).`,
    );
  });

  const doc = YAML.parse(source);
  const fixtures = buildFixtures();
  applyExamples(doc, fixtures);

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, YAML.stringify(doc), "utf8");

  console.log(`Мок-спецификация с фейковыми данными записана в ${path.relative(rootDir, outPath)}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
