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
  height: integer("height"), // in centimeters
  weight: integer("weight"), // in kilograms
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

// Individual yoga poses with developmental benefits
export const yogaPoses = pgTable("yoga_poses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  sanskritName: varchar("sanskrit_name"),
  description: text("description"),
  instructions: text("instructions"),
  developmentCategory: varchar("development_category").notNull(), // openness, conscientiousness, extraversion, etc.
  benefits: jsonb("benefits"), // array of specific benefits
  ageMin: integer("age_min").notNull().default(5),
  ageMax: integer("age_max").notNull().default(16),
  difficulty: varchar("difficulty").notNull().default('beginner'), // beginner, intermediate, advanced
  duration: integer("duration").default(60), // seconds to hold pose
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  practiceType: varchar("practice_type").default('pose'), // pose or practice/meditation
  practiceDescription: text("practice_description"), // for associated practices
  isActive: boolean("is_active").default(true),
});

// Track individual pose sessions for children
export const yogaPoseSessions = pgTable("yoga_pose_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  poseId: varchar("pose_id").references(() => yogaPoses.id).notNull(),
  duration: integer("duration"), // actual seconds held
  completedAt: timestamp("completed_at").defaultNow(),
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

// Recipes library
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // breakfast, lunch, dinner, snack
  dietaryType: varchar("dietary_type").notNull().default('vegetarian'), // vegetarian, vegan, non-veg, jain
  ageMin: integer("age_min").default(5),
  ageMax: integer("age_max").default(16),
  prepTime: integer("prep_time"), // minutes
  cookTime: integer("cook_time"), // minutes
  servings: integer("servings").default(1),
  ingredients: jsonb("ingredients").notNull(), // array of {name, quantity, unit}
  instructions: jsonb("instructions").notNull(), // array of steps
  nutrition: jsonb("nutrition").notNull(), // {calories, protein, carbs, fats, fiber, vitamins}
  tags: jsonb("tags"), // ['high-protein', 'low-sugar', 'iron-rich']
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nutritional goals for children
export const nutritionalGoals = pgTable("nutritional_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  dailyCalories: integer("daily_calories"),
  dailyProtein: integer("daily_protein"), // grams
  dailyCarbs: integer("daily_carbs"), // grams
  dailyFats: integer("daily_fats"), // grams
  dailyFiber: integer("daily_fiber"), // grams
  dailyWater: integer("daily_water"), // ml
  vitamins: jsonb("vitamins"), // specific vitamin targets
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily nutrition tracking
export const dailyNutritionTracking = pgTable("daily_nutrition_tracking", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  date: timestamp("date").notNull(),
  breakfast: jsonb("breakfast"), // {recipeId, consumed: true/false, notes}
  lunch: jsonb("lunch"),
  dinner: jsonb("dinner"),
  snacks: jsonb("snacks"), // array of snacks
  waterIntake: integer("water_intake"), // ml
  totalCalories: integer("total_calories"),
  totalProtein: integer("total_protein"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meal preferences for children
export const mealPreferences = pgTable("meal_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  dietaryType: varchar("dietary_type").default('vegetarian'), // vegetarian, vegan, non-veg, jain
  allergies: jsonb("allergies"), // ['nuts', 'dairy', 'gluten']
  dislikedFoods: jsonb("disliked_foods"), // ['broccoli', 'spinach']
  favoriteRecipes: jsonb("favorite_recipes"), // array of recipe IDs
  specialNotes: text("special_notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Progress photos for tracking growth
export const progressPhotos = pgTable("progress_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id).notNull(),
  photoUrl: varchar("photo_url").notNull(),
  photoDate: timestamp("photo_date").defaultNow(),
  weight: integer("weight"), // kg at time of photo
  height: integer("height"), // cm at time of photo
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

export const insertYogaPoseSessionSchema = createInsertSchema(yogaPoseSessions).omit({
  id: true,
  completedAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertMealPreferencesSchema = createInsertSchema(mealPreferences).omit({
  id: true,
  updatedAt: true,
});

export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertNutritionalGoalsSchema = createInsertSchema(nutritionalGoals).omit({
  id: true,
  updatedAt: true,
});

export const insertDailyNutritionTrackingSchema = createInsertSchema(dailyNutritionTracking).omit({
  id: true,
  createdAt: true,
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
export type YogaPose = typeof yogaPoses.$inferSelect;
export type YogaPoseSession = typeof yogaPoseSessions.$inferSelect;
export type InsertYogaPoseSession = z.infer<typeof insertYogaPoseSessionSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type MealPreferences = typeof mealPreferences.$inferSelect;
export type InsertMealPreferences = z.infer<typeof insertMealPreferencesSchema>;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;
export type NutritionalGoals = typeof nutritionalGoals.$inferSelect;
export type InsertNutritionalGoals = z.infer<typeof insertNutritionalGoalsSchema>;
export type DailyNutritionTracking = typeof dailyNutritionTracking.$inferSelect;
export type InsertDailyNutritionTracking = z.infer<typeof insertDailyNutritionTrackingSchema>;
