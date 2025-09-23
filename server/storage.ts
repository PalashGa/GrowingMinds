import {
  users,
  children,
  assessmentTypes,
  assessmentQuestions,
  assessmentResults,
  yogaPrograms,
  yogaSessions,
  nutritionPlans,
  roboticsModules,
  roboticsProgress,
  educationalGames,
  gameScores,
  type User,
  type UpsertUser,
  type Child,
  type InsertChild,
  type AssessmentType,
  type AssessmentQuestion,
  type AssessmentResult,
  type InsertAssessmentResult,
  type YogaProgram,
  type YogaSession,
  type InsertYogaSession,
  type NutritionPlan,
  type InsertNutritionPlan,
  type RoboticsModule,
  type RoboticsProgress,
  type EducationalGame,
  type GameScore,
  type InsertGameScore,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User>;
  
  // Child operations
  getChildrenByParentId(parentId: string): Promise<Child[]>;
  getChild(id: string): Promise<Child | undefined>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: string, updates: Partial<Child>): Promise<Child>;
  
  // Assessment operations
  getAssessmentTypes(): Promise<AssessmentType[]>;
  getAssessmentTypesByAge(age: number): Promise<AssessmentType[]>;
  getAssessmentQuestions(assessmentTypeId: string): Promise<AssessmentQuestion[]>;
  saveAssessmentResult(result: InsertAssessmentResult): Promise<AssessmentResult>;
  getAssessmentResults(childId: string): Promise<AssessmentResult[]>;
  
  // Yoga operations
  getYogaProgramsByAge(age: number): Promise<YogaProgram[]>;
  saveYogaSession(session: InsertYogaSession): Promise<YogaSession>;
  getYogaSessions(childId: string): Promise<YogaSession[]>;
  
  // Nutrition operations
  getNutritionPlan(childId: string, weekOf: Date): Promise<NutritionPlan | undefined>;
  saveNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan>;
  
  // Robotics operations
  getRoboticsModulesByAge(age: number): Promise<RoboticsModule[]>;
  getRoboticsProgress(childId: string): Promise<RoboticsProgress[]>;
  updateRoboticsProgress(childId: string, moduleId: string, progress: number, status: string): Promise<void>;
  
  // Games operations
  getEducationalGamesByAge(age: number): Promise<EducationalGame[]>;
  saveGameScore(score: InsertGameScore): Promise<GameScore>;
  getGameScores(childId: string): Promise<GameScore[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: 'premium',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Child operations
  async getChildrenByParentId(parentId: string): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.parentId, parentId));
  }

  async getChild(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }

  async createChild(child: InsertChild): Promise<Child> {
    const [newChild] = await db.insert(children).values(child).returning();
    return newChild;
  }

  async updateChild(id: string, updates: Partial<Child>): Promise<Child> {
    const [child] = await db
      .update(children)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(children.id, id))
      .returning();
    return child;
  }

  // Assessment operations
  async getAssessmentTypes(): Promise<AssessmentType[]> {
    return await db.select().from(assessmentTypes).where(eq(assessmentTypes.isActive, true));
  }

  async getAssessmentTypesByAge(age: number): Promise<AssessmentType[]> {
    return await db
      .select()
      .from(assessmentTypes)
      .where(
        and(
          eq(assessmentTypes.isActive, true),
          lte(assessmentTypes.ageMin, age),
          gte(assessmentTypes.ageMax, age)
        )
      );
  }

  async getAssessmentQuestions(assessmentTypeId: string): Promise<AssessmentQuestion[]> {
    return await db
      .select()
      .from(assessmentQuestions)
      .where(eq(assessmentQuestions.assessmentTypeId, assessmentTypeId))
      .orderBy(assessmentQuestions.orderIndex);
  }

  async saveAssessmentResult(result: InsertAssessmentResult): Promise<AssessmentResult> {
    const [newResult] = await db.insert(assessmentResults).values(result).returning();
    return newResult;
  }

  async getAssessmentResults(childId: string): Promise<AssessmentResult[]> {
    return await db
      .select()
      .from(assessmentResults)
      .where(eq(assessmentResults.childId, childId))
      .orderBy(desc(assessmentResults.completedAt));
  }

  // Yoga operations
  async getYogaProgramsByAge(age: number): Promise<YogaProgram[]> {
    return await db
      .select()
      .from(yogaPrograms)
      .where(
        and(
          eq(yogaPrograms.isActive, true),
          lte(yogaPrograms.ageMin, age),
          gte(yogaPrograms.ageMax, age)
        )
      );
  }

  async saveYogaSession(session: InsertYogaSession): Promise<YogaSession> {
    const [newSession] = await db.insert(yogaSessions).values(session).returning();
    return newSession;
  }

  async getYogaSessions(childId: string): Promise<YogaSession[]> {
    return await db
      .select()
      .from(yogaSessions)
      .where(eq(yogaSessions.childId, childId))
      .orderBy(desc(yogaSessions.startedAt));
  }

  // Nutrition operations
  async getNutritionPlan(childId: string, weekOf: Date): Promise<NutritionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(nutritionPlans)
      .where(
        and(
          eq(nutritionPlans.childId, childId),
          eq(nutritionPlans.weekOf, weekOf)
        )
      );
    return plan;
  }

  async saveNutritionPlan(plan: InsertNutritionPlan): Promise<NutritionPlan> {
    const [newPlan] = await db.insert(nutritionPlans).values(plan).returning();
    return newPlan;
  }

  // Robotics operations
  async getRoboticsModulesByAge(age: number): Promise<RoboticsModule[]> {
    return await db
      .select()
      .from(roboticsModules)
      .where(
        and(
          eq(roboticsModules.isActive, true),
          lte(roboticsModules.ageMin, age),
          gte(roboticsModules.ageMax, age)
        )
      )
      .orderBy(roboticsModules.orderIndex);
  }

  async getRoboticsProgress(childId: string): Promise<RoboticsProgress[]> {
    return await db
      .select()
      .from(roboticsProgress)
      .where(eq(roboticsProgress.childId, childId));
  }

  async updateRoboticsProgress(childId: string, moduleId: string, progress: number, status: string): Promise<void> {
    await db
      .insert(roboticsProgress)
      .values({
        childId,
        moduleId,
        progress: progress.toString(),
        status,
        completedAt: status === 'completed' ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [roboticsProgress.childId, roboticsProgress.moduleId],
        set: {
          progress: progress.toString(),
          status,
          completedAt: status === 'completed' ? new Date() : null,
        },
      });
  }

  // Games operations
  async getEducationalGamesByAge(age: number): Promise<EducationalGame[]> {
    return await db
      .select()
      .from(educationalGames)
      .where(
        and(
          eq(educationalGames.isActive, true),
          lte(educationalGames.ageMin, age),
          gte(educationalGames.ageMax, age)
        )
      );
  }

  async saveGameScore(score: InsertGameScore): Promise<GameScore> {
    const [newScore] = await db.insert(gameScores).values(score).returning();
    return newScore;
  }

  async getGameScores(childId: string): Promise<GameScore[]> {
    return await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.childId, childId))
      .orderBy(desc(gameScores.playedAt));
  }
}

export const storage = new DatabaseStorage();
