import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertChildSchema, insertAssessmentResultSchema, insertYogaSessionSchema, insertYogaPoseSessionSchema, insertNutritionPlanSchema, insertGameScoreSchema } from "@shared/schema";
import { z } from "zod";
import { generateReport, getAssessmentDataForReport } from "./reportService";

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

  app.get('/api/assessments/types/:typeId', async (req, res) => {
    try {
      const assessmentType = await storage.getAssessmentType(req.params.typeId);
      if (!assessmentType) {
        return res.status(404).json({ message: "Assessment type not found" });
      }
      res.json(assessmentType);
    } catch (error) {
      console.error("Error fetching assessment type:", error);
      res.status(500).json({ message: "Failed to fetch assessment type" });
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

  // Yoga poses routes
  app.get('/api/yoga/poses', async (req, res) => {
    try {
      const age = req.query.age ? parseInt(req.query.age as string) : undefined;
      const category = req.query.category as string | undefined;
      
      let poses;
      if (category) {
        poses = await storage.getYogaPosesByCategory(category);
      } else if (age) {
        poses = await storage.getYogaPosesByAge(age);
      } else {
        poses = await storage.getAllYogaPoses();
      }
      res.json(poses);
    } catch (error) {
      console.error("Error fetching yoga poses:", error);
      res.status(500).json({ message: "Failed to fetch yoga poses" });
    }
  });

  app.get('/api/yoga/poses/:id', async (req, res) => {
    try {
      const pose = await storage.getYogaPose(req.params.id);
      if (!pose) {
        return res.status(404).json({ message: "Pose not found" });
      }
      res.json(pose);
    } catch (error) {
      console.error("Error fetching yoga pose:", error);
      res.status(500).json({ message: "Failed to fetch yoga pose" });
    }
  });

  app.post('/api/yoga/pose-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = insertYogaPoseSessionSchema.parse(req.body);
      const session = await storage.saveYogaPoseSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error saving yoga pose session:", error);
      res.status(500).json({ message: "Failed to save yoga pose session" });
    }
  });

  app.get('/api/children/:childId/yoga-pose-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getYogaPoseSessions(req.params.childId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching yoga pose sessions:", error);
      res.status(500).json({ message: "Failed to fetch yoga pose sessions" });
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

  // Report Generation API
  app.post('/api/reports/generate', isAuthenticated, async (req: any, res) => {
    try {
      const { childId, assessmentTypeId } = req.body;
      
      if (!childId || !assessmentTypeId) {
        return res.status(400).json({ message: "childId and assessmentTypeId are required" });
      }

      // Verify child belongs to user
      const child = await storage.getChild(childId);
      if (!child || child.parentId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const assessmentData = await getAssessmentDataForReport(childId, assessmentTypeId);
      if (!assessmentData) {
        return res.status(404).json({ message: "Assessment data not found. Please complete the assessment first." });
      }

      const report = await generateReport(assessmentData);
      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report. Please try again." });
    }
  });

  // Get available reports for a child
  app.get('/api/children/:childId/available-reports', isAuthenticated, async (req: any, res) => {
    try {
      const child = await storage.getChild(req.params.childId);
      if (!child || child.parentId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const assessmentResults = await storage.getAssessmentResults(req.params.childId);
      const assessmentTypes = await storage.getAssessmentTypes();

      const availableReports = assessmentTypes.map(type => {
        const result = assessmentResults.find(r => r.assessmentTypeId === type.id);
        return {
          assessmentTypeId: type.id,
          assessmentTypeName: type.name,
          isCompleted: !!result,
          completedAt: result?.completedAt || null
        };
      });

      res.json(availableReports);
    } catch (error) {
      console.error("Error fetching available reports:", error);
      res.status(500).json({ message: "Failed to fetch available reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
