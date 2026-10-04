import {
  pgTable,
  serial,
  text,
  real,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const produceStatusEnum = pgEnum("produce_status", [
  "optimal",
  "good",
  "attention",
  "critical",
]);

export const produceTypeEnum = pgEnum("produce_type", [
  "vegetables",
  "fruits",
  "herbs",
  "grains",
]);

export const systemStatusEnum = pgEnum("system_status", [
  "active",
  "idle",
  "charging",
  "error",
]);

// Stored produce table
export const produce = pgTable("produce", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: produceTypeEnum("type").notNull().default("vegetables"),
  quantity: real("quantity").notNull().default(0),
  unit: text("unit").notNull().default("kg"),
  status: produceStatusEnum("status").notNull().default("good"),
  storedAt: timestamp("stored_at").notNull().defaultNow(),
  targetTempMin: real("target_temp_min").notNull().default(10),
  targetTempMax: real("target_temp_max").notNull().default(13),
  shelfLifeDays: integer("shelf_life_days").notNull().default(14),
  crate: text("crate").notNull().default("Crate-01"),
  imageUrl: text("image_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Chamber readings table
export const chamberReadings = pgTable("chamber_readings", {
  id: serial("id").primaryKey(),
  chamberId: text("chamber_id").notNull().default("Chamber-1"),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  capacity: real("capacity").notNull().default(0),
  maxCapacity: real("max_capacity").notNull().default(175),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

// System health table
export const systemHealth = pgTable("system_health", {
  id: serial("id").primaryKey(),
  componentName: text("component_name").notNull(),
  status: systemStatusEnum("status").notNull().default("active"),
  value: real("value"),
  unit: text("unit"),
  description: text("description"),
  lastChecked: timestamp("last_checked").notNull().defaultNow(),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("info"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Power readings table
export const powerReadings = pgTable("power_readings", {
  id: serial("id").primaryKey(),
  solarWatts: real("solar_watts").notNull().default(0),
  storageWatts: real("storage_watts").notNull().default(0),
  storagePercent: real("storage_percent").notNull().default(0),
  systemWatts: real("system_watts").notNull().default(0),
  toServerWatts: real("to_server_watts").notNull().default(0),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});
