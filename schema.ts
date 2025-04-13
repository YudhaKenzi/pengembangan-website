import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("fullName").notNull(),
  email: text("email").notNull().unique(),
  nik: text("nik").unique(),
  phone: text("phone"),
  role: text("role").$type<"user" | "admin">().notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const updateUserSchema = createInsertSchema(users).partial().omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

// Submissions table (for document requests)
export const submissions = pgTable("submissions", {
  id: text("id").primaryKey(), // Format: AK-YYYY-XXXX
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., "na", "ktp", "kk", etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  documents: text("documents").array(), // Array of document file paths
  status: text("status").$type<"pending" | "processing" | "completed" | "rejected">().notNull().default("pending"),
  adminNotes: text("admin_notes"),
  adminFiles: text("admin_files").array(), // Array of admin-uploaded file paths
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  adminNotes: true,
  adminFiles: true,
});

export const updateSubmissionSchema = createInsertSchema(submissions).partial().omit({
  id: true,
  userId: true,
  type: true,
  title: true,
  description: true,
  documents: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type UpdateSubmission = z.infer<typeof updateSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect & {
  user?: User;
};

// Add additional tables as needed
