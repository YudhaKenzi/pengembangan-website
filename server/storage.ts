import { users, type User, type InsertUser, type UpdateUser, type Submission, type InsertSubmission, type UpdateSubmission } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomUUID } from "crypto";

const MemoryStore = createMemoryStore(session);

// Storage interface that defines all database operations
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByNik(nik: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: UpdateUser): Promise<User>;
  
  // Submissions
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: string): Promise<Submission | undefined>;
  getUserSubmissions(userId: number): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  updateSubmission(id: string, submissionData: UpdateSubmission): Promise<Submission>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private submissions: Map<string, Submission>;
  public sessionStore: session.SessionStore;
  currentUserId: number;

  constructor() {
    this.users = new Map();
    this.submissions = new Map();
    this.currentUserId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByNik(nik: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.nik === nik
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: UpdateUser): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Submission methods
  async getSubmissions(): Promise<Submission[]> {
    const submissions = Array.from(this.submissions.values());
    
    // Sort by creation date (newest first)
    submissions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Populate user information
    return submissions.map(submission => {
      const user = this.users.get(submission.userId);
      return {
        ...submission,
        user
      };
    });
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (!submission) return undefined;
    
    const user = this.users.get(submission.userId);
    return {
      ...submission,
      user
    };
  }

  async getUserSubmissions(userId: number): Promise<Submission[]> {
    const submissions = Array.from(this.submissions.values())
      .filter(submission => submission.userId === userId);
    
    // Sort by creation date (newest first)
    submissions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Populate user information
    return submissions.map(submission => {
      const user = this.users.get(submission.userId);
      return {
        ...submission,
        user
      };
    });
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = `AK-${new Date().getFullYear()}-${String(this.submissions.size + 1).padStart(4, '0')}`;
    const createdAt = new Date().toISOString();
    
    const submission: Submission = {
      ...insertSubmission,
      id,
      createdAt,
      updatedAt: createdAt,
      adminNotes: null,
      adminFiles: []
    };
    
    this.submissions.set(id, submission);
    
    // Include user data in the response
    const user = this.users.get(submission.userId);
    return {
      ...submission,
      user
    };
  }

  async updateSubmission(id: string, submissionData: UpdateSubmission): Promise<Submission> {
    const submission = this.submissions.get(id);
    if (!submission) {
      throw new Error(`Submission with id ${id} not found`);
    }

    const updatedSubmission = { 
      ...submission, 
      ...submissionData, 
      updatedAt: new Date().toISOString() 
    };
    
    this.submissions.set(id, updatedSubmission);
    
    // Include user data in the response
    const user = this.users.get(updatedSubmission.userId);
    return {
      ...updatedSubmission,
      user
    };
  }
}

export const storage = new MemStorage();
