import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Create default admin account if it doesn't exist
  (async () => {
    const adminUsername = "admin";
    const existingAdmin = await storage.getUserByUsername(adminUsername);
    
    if (!existingAdmin) {
      await storage.createUser({
        username: adminUsername,
        password: await hashPassword("admin12345"),
        fullName: "Admin Desa",
        email: "admin@desaairkulim.desa.id",
        role: "admin",
        nik: null,
        phone: null
      });
      console.log("Default admin account created");
    }
  })();

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "desa-air-kulim-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
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

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Username atau password salah" });
      
      const { role } = req.body;
      
      // If role is specified (user or admin tab selection), check if it matches
      if (role && user.role !== role) {
        return res.status(401).json({ 
          message: role === "admin" 
            ? "Akun ini bukan akun administrator" 
            : "Silakan login sebagai admin"
        });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.patch("/api/user/profile", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { fullName, email, phone } = req.body;
    
    storage.updateUser(req.user.id, { 
      fullName, 
      email, 
      phone
    })
      .then(user => res.json(user))
      .catch(next);
  });

  app.post("/api/user/change-password", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Verify current password
      const isValidPassword = await comparePasswords(currentPassword, req.user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Password saat ini tidak valid" });
      }
      
      // Update with new password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(req.user.id, { password: hashedPassword });
      
      res.json({ message: "Password berhasil diperbarui" });
    } catch (error) {
      next(error);
    }
  });
}
