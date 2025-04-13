import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { upload } from "./multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "..", "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API Routes
  // ==================

  // User management
  app.get("/api/users", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    
    try {
      const { username, email, nik } = req.body;
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email sudah digunakan" });
      }
      
      if (nik) {
        const existingNik = await storage.getUserByNik(nik);
        if (existingNik) {
          return res.status(400).json({ message: "NIK sudah terdaftar" });
        }
      }
      
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  // Submissions
  app.post("/api/submissions", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Silakan login terlebih dahulu" });
    }
    
    try {
      const userId = req.user.id;
      const { type, title, description, documents } = req.body;
      
      const submission = await storage.createSubmission({
        userId,
        type,
        title,
        description,
        documents: documents || [],
        status: "pending",
      });
      
      res.status(201).json(submission);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/submissions", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    
    try {
      const submissions = await storage.getSubmissions();
      res.json(submissions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/submissions/user", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Silakan login terlebih dahulu" });
    }
    
    try {
      const userId = req.user.id;
      const submissions = await storage.getUserSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/submissions/:id", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Silakan login terlebih dahulu" });
    }
    
    try {
      const submissionId = req.params.id;
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
      }
      
      // Check if user is authorized to view this submission
      if (req.user.role !== "admin" && submission.userId !== req.user.id) {
        return res.status(403).json({ message: "Akses ditolak" });
      }
      
      res.json(submission);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/submissions/:id", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    
    try {
      const submissionId = req.params.id;
      const { status, adminNotes, adminFiles } = req.body;
      
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ message: "Pengajuan tidak ditemukan" });
      }
      
      const updatedSubmission = await storage.updateSubmission(submissionId, {
        status,
        adminNotes,
        adminFiles
      });
      
      res.json(updatedSubmission);
    } catch (error) {
      next(error);
    }
  });

  // File uploads
  app.post("/api/upload", upload.array("files", 5), (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Silakan login terlebih dahulu" });
    }
    
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Tidak ada file yang diunggah" });
    }
    
    const fileUrls = files.map(file => `/uploads/${file.filename}`);
    
    res.json({
      message: "File berhasil diunggah",
      fileUrls
    });
  });

  // Templates API
  app.post("/api/templates", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    
    try {
      // In a real implementation, this would save to a templates table in the database
      // For now, we'll just return success with the data
      res.json({ 
        success: true,
        message: "Template berhasil disimpan",
        template: req.body
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/templates/:id", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    
    try {
      // In a real implementation, this would delete from a templates table
      res.json({ 
        success: true,
        message: "Template berhasil dihapus"
      });
    } catch (error) {
      next(error);
    }
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Silakan login terlebih dahulu" });
    }
    next();
  }, (req, res, next) => {
    const fileName = req.path.substring(1); // Remove leading slash
    res.sendFile(fileName, {
      root: uploadsDir,
      dotfiles: "deny"
    }, (err) => {
      if (err) {
        next(err);
      }
    });
  });

  // Organization settings
  app.post("/api/settings/organization", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }
    
    try {
      // In real implementation, this would save to a settings table in the database
      // For now, we'll just return success
      res.json({ 
        message: "Pengaturan organisasi berhasil diperbarui",
        data: req.body
      });
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
