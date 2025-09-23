import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertChildSchema, insertAssessmentResultSchema, insertYogaSessionSchema, insertNutritionPlanSchema, insertGameScoreSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Children management
  app.get('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const children = await storage.getChildrenByParentId(userId);
      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  app.post('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const childData = insertChildSchema.parse({ ...req.body, parentId: userId });
      const child = await storage.createChild(childData);
      res.json(child);
    } catch (error) {
      console.error("Error creating child:", error);
      res.status(500).json({ message: "Failed to create child profile" });
    }
  });

  app.get('/api/children/:id', isAuthenticated, async (req: any, res) => {
    try {
      const child = await storage.getChild(req.params.id);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      // Check if the child belongs to the authenticated user
      const userId = req.user.claims.sub;
      if (child.parentId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(child);
    } catch (error) {
      console.error("Error fetching child:", error);
      res.status(500).json({ message: "Failed to fetch child" });
    }
  });

  // Assessment routes
  app.get('/api/assessments/types', async (req, res) => {
    try {
      const age = req.query.age ? parseInt(req.query.age as string) : undefined;
      const assessmentTypes = age 
        ? await storage.getAssessmentTypesByAge(age)
        : await storage.getAssessmentTypes();
      res.json(assessmentTypes);
    } catch (error) {
      console.error("Error fetching assessment types:", error);
      res.status(500).json({ message: "Failed to fetch assessment types" });
    }
  });

  app.get('/api/assessments/:typeId/questions', async (req, res) => {
    try {
      const questions = await storage.getAssessmentQuestions(req.params.typeId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  app.post('/api/assessments/results', isAuthenticated, async (req: any, res) => {
    try {
      const resultData = insertAssessmentResultSchema.parse(req.body);
      const result = await storage.saveAssessmentResult(resultData);
      res.json(result);
    } catch (error) {
      console.error("Error saving assessment result:", error);
      res.status(500).json({ message: "Failed to save assessment result" });
    }
  });

  app.get('/api/children/:childId/assessments', isAuthenticated, async (req: any, res) => {
    try {
      const results = await storage.getAssessmentResults(req.params.childId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching assessment results:", error);
      res.status(500).json({ message: "Failed to fetch assessment results" });
    }
  });

  // Yoga routes
  app.get('/api/yoga/programs', async (req, res) => {
    try {
      const age = req.query.age ? parseInt(req.query.age as string) : 10;
      const programs = await storage.getYogaProgramsByAge(age);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching yoga programs:", error);
      res.status(500).json({ message: "Failed to fetch yoga programs" });
    }
  });

  app.post('/api/yoga/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = insertYogaSessionSchema.parse(req.body);
      const session = await storage.saveYogaSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error saving yoga session:", error);
      res.status(500).json({ message: "Failed to save yoga session" });
    }
  });

  app.get('/api/children/:childId/yoga-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getYogaSessions(req.params.childId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching yoga sessions:", error);
      res.status(500).json({ message: "Failed to fetch yoga sessions" });
    }
  });

  // Nutrition routes
  app.get('/api/children/:childId/nutrition-plan', isAuthenticated, async (req: any, res) => {
    try {
      const weekOf = req.query.weekOf ? new Date(req.query.weekOf as string) : new Date();
      const plan = await storage.getNutritionPlan(req.params.childId, weekOf);
      res.json(plan);
    } catch (error) {
      console.error("Error fetching nutrition plan:", error);
      res.status(500).json({ message: "Failed to fetch nutrition plan" });
    }
  });

  app.post('/api/nutrition-plans', isAuthenticated, async (req: any, res) => {
    try {
      const planData = insertNutritionPlanSchema.parse(req.body);
      const plan = await storage.saveNutritionPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error("Error saving nutrition plan:", error);
      res.status(500).json({ message: "Failed to save nutrition plan" });
    }
  });

  // Robotics routes
  app.get('/api/robotics/modules', async (req, res) => {
    try {
      const age = req.query.age ? parseInt(req.query.age as string) : 10;
      const modules = await storage.getRoboticsModulesByAge(age);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching robotics modules:", error);
      res.status(500).json({ message: "Failed to fetch robotics modules" });
    }
  });

  app.get('/api/children/:childId/robotics-progress', isAuthenticated, async (req: any, res) => {
    try {
      const progress = await storage.getRoboticsProgress(req.params.childId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching robotics progress:", error);
      res.status(500).json({ message: "Failed to fetch robotics progress" });
    }
  });

  app.put('/api/robotics-progress', isAuthenticated, async (req: any, res) => {
    try {
      const { childId, moduleId, progress, status } = req.body;
      await storage.updateRoboticsProgress(childId, moduleId, progress, status);
      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      console.error("Error updating robotics progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Games routes
  app.get('/api/games', async (req, res) => {
    try {
      const age = req.query.age ? parseInt(req.query.age as string) : 10;
      const games = await storage.getEducationalGamesByAge(age);
      res.json(games);
    } catch (error) {
      console.error("Error fetching games:", error);
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.post('/api/game-scores', isAuthenticated, async (req: any, res) => {
    try {
      const scoreData = insertGameScoreSchema.parse(req.body);
      const score = await storage.saveGameScore(scoreData);
      res.json(score);
    } catch (error) {
      console.error("Error saving game score:", error);
      res.status(500).json({ message: "Failed to save game score" });
    }
  });

  app.get('/api/children/:childId/game-scores', isAuthenticated, async (req: any, res) => {
    try {
      const scores = await storage.getGameScores(req.params.childId);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching game scores:", error);
      res.status(500).json({ message: "Failed to fetch game scores" });
    }
  });

  // Note: Payment features have been removed to run without Stripe integration

  const httpServer = createServer(app);
  return httpServer;
}
