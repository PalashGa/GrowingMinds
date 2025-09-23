import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default('free'), // free, premium, family
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Child profiles linked to parent users
export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  age: integer("age").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  profileColor: varchar("profile_color").default('#4F46E5'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Assessment types and questions
export const assessmentTypes = pgTable("assessment_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // behavioral, personality, iq, career
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  ageMin: integer("age_min").notNull(),
  ageMax: integer("age_max").notNull(),
  duration: integer("duration"), // minutes
  isActive: boolean("is_active").default(true),
});

export const assessmentQuestions = pgTable("assessment_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentTypeId: varchar("assessment_type_id").references(() => assessmentTypes.id).notNull(),
  question: text("question").notNull(),
  questionType: varchar("question_type").notNull(), // multiple_choice, scale, text
  options: jsonb("options"), // for multiple choice questions
  orderIndex: integer("order_index").notNull(),
  isRequired: boolean("is_required").default(true),
});

// Assessment results
export const assessmentResults = pgTable("assessment_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  assessmentTypeId: varchar("assessment_type_id").references(() => assessmentTypes.id).notNull(),
  answers: jsonb("answers").notNull(),
  scores: jsonb("scores"), // calculated scores
  insights: jsonb("insights"), // generated insights
  recommendations: text("recommendations"),
  reportUrl: varchar("report_url"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Yoga programs and sessions
export const yogaPrograms = pgTable("yoga_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  ageMin: integer("age_min").notNull(),
  ageMax: integer("age_max").notNull(),
  difficulty: varchar("difficulty").notNull(), // beginner, intermediate, advanced
  duration: integer("duration"), // minutes
  videoUrl: varchar("video_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  benefits: jsonb("benefits"), // array of benefits
  isActive: boolean("is_active").default(true),
});

export const yogaSessions = pgTable("yoga_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  yogaProgramId: varchar("yoga_program_id").references(() => yogaPrograms.id).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"), // actual duration in minutes
  rating: integer("rating"), // 1-5 stars
  notes: text("notes"),
});

// Nutrition plans
export const nutritionPlans = pgTable("nutrition_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  weekOf: timestamp("week_of").notNull(),
  meals: jsonb("meals").notNull(), // structured meal plan data
  goals: jsonb("goals"), // nutritional goals
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Robotics learning modules
export const roboticsModules = pgTable("robotics_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  ageMin: integer("age_min").notNull(),
  ageMax: integer("age_max").notNull(),
  difficulty: varchar("difficulty").notNull(),
  orderIndex: integer("order_index").notNull(),
  content: jsonb("content"), // lesson content
  videoUrl: varchar("video_url"),
  projectInstructions: text("project_instructions"),
  isActive: boolean("is_active").default(true),
});

export const roboticsProgress = pgTable("robotics_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  moduleId: varchar("module_id").references(() => roboticsModules.id).notNull(),
  status: varchar("status").notNull().default('not_started'), // not_started, in_progress, completed
  progress: decimal("progress", { precision: 5, scale: 2 }).default('0'), // 0-100
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

// Educational games
export const educationalGames = pgTable("educational_games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  ageMin: integer("age_min").notNull(),
  ageMax: integer("age_max").notNull(),
  category: varchar("category").notNull(), // math, science, reading, logic
  difficulty: varchar("difficulty").notNull(),
  gameUrl: varchar("game_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  learningObjectives: jsonb("learning_objectives"),
  isActive: boolean("is_active").default(true),
});

export const gameScores = pgTable("game_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  gameId: varchar("game_id").references(() => educationalGames.id).notNull(),
  score: integer("score").notNull(),
  timeSpent: integer("time_spent"), // minutes
  level: integer("level"),
  playedAt: timestamp("played_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertChildSchema = createInsertSchema(children).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentResultSchema = createInsertSchema(assessmentResults).omit({
  id: true,
  completedAt: true,
});

export const insertYogaSessionSchema = createInsertSchema(yogaSessions).omit({
  id: true,
  startedAt: true,
});

export const insertNutritionPlanSchema = createInsertSchema(nutritionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({
  id: true,
  playedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Child = typeof children.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type AssessmentType = typeof assessmentTypes.$inferSelect;
export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type AssessmentResult = typeof assessmentResults.$inferSelect;
export type InsertAssessmentResult = z.infer<typeof insertAssessmentResultSchema>;
export type YogaProgram = typeof yogaPrograms.$inferSelect;
export type YogaSession = typeof yogaSessions.$inferSelect;
export type InsertYogaSession = z.infer<typeof insertYogaSessionSchema>;
export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = z.infer<typeof insertNutritionPlanSchema>;
export type RoboticsModule = typeof roboticsModules.$inferSelect;
export type RoboticsProgress = typeof roboticsProgress.$inferSelect;
export type EducationalGame = typeof educationalGames.$inferSelect;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
