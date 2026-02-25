import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertOrderSchema, insertCouponSchema, insertCashShiftSchema } from "@shared/schema";
import { seed } from "./seed";
import multer from "multer";
import path from "path";
import fs from "fs";
import { UserModel } from "./models";
import { paymentGateway } from "./payments";

// Configure storage for uploaded files
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, webp, gif) are allowed"));
  }
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get user by phone (publicly accessible for login check)
  app.get("/api/admin/users/by-phone/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      let cleanPhone = phone.replace(/\D/g, "");
      // Normalize to 9 digits core
      if (cleanPhone.startsWith("966")) cleanPhone = cleanPhone.substring(3);
      if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.substring(1);
      
      console.log(`[API] Checking user by phone: ${cleanPhone}`);
      
      // Try fuzzy search logic similar to auth
      const user = await UserModel.findOne({ 
        $or: [
          { phone: cleanPhone },
          { username: cleanPhone },
          { phone: "0" + cleanPhone },
          { username: "0" + cleanPhone },
          { phone: "966" + cleanPhone },
          { phone: new RegExp(cleanPhone + "$") }
        ]
      }).lean();

      if (!user) {
        return res.status(404).send("User not found");
      }
      
      res.json({
        id: (user as any)._id?.toString() || (user as any).id,
        role: user.role,
        isActive: (user as any).isActive,
        name: user.name
      });
    } catch (err) {
      console.error(`[API] Error in by-phone:`, err);
      res.status(500).send("Internal server error");
    }
  });

  // Auth setup
  setupAuth(app);
  
  // Serve uploaded files statically
  const express = await import("express");
  app.use("/uploads", express.static(uploadDir));

  // Image Upload Endpoint
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Bank Transfer Receipt Upload
  app.post("/api/orders/:id/receipt", upload.single("receipt"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ message: "No receipt file uploaded" });
    
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      
      const user = req.user as any;
      if (user.role !== "admin" && order.userId !== user.id) {
        return res.sendStatus(403);
      }
      
      const receiptUrl = `/uploads/${req.file.filename}`;
      const updatedOrder = await storage.updateOrderReceipt(req.params.id, receiptUrl);
      res.json(updatedOrder);
    } catch (err) {
      console.error("[API] Error uploading receipt:", err);
      res.status(500).send("Internal server error");
    }
  });
  
  // Seed data
  try {
    await seed();
  } catch (err) {
    console.error("Seeding failed:", err);
  }

  // Middleware for granular permissions
  const checkPermission = (permission: string) => {
    return (req: any, res: any, next: any) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const user = req.user as any;
      if (user.role === "admin" || (user.permissions && user.permissions.includes(permission))) {
        return next();
      }
      res.status(403).json({ message: "ليس لديك صلاحية للقيام بهذا الإجراء" });
    };
  };

  // RBAC Page Protection Middleware for common admin sections
  const protectAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role === "admin" || user.role === "employee" || user.role === "cashier" || user.role === "accountant" || user.role === "support") {
      return next();
    }
    res.status(403).json({ message: "دخول غير مصرح" });
  };

  // Products
  app.get(api.products.list.path, async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.patch("/api/products/:id", checkPermission("products.edit"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const product = await storage.updateProduct(req.params.id, req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", checkPermission("products.edit"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteProduct(req.params.id);
    res.sendStatus(200);
  });

  // Orders
  app.get(api.orders.list.path, checkPermission("orders.view"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role === "admin" || (user.permissions && user.permissions.includes("orders.view"))) {
      const orders = await storage.getOrders();
      res.json(orders);
    } else {
      const orders = await storage.getOrdersByUser(user.id || user._id);
      res.json(orders);
    }
  });

  app.get(api.orders.my.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const orders = await storage.getOrdersByUser(user.id || user._id);
    res.json(orders);
  });

  app.post("/api/auth/verify-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { password } = req.body;
    if (!password) return res.status(400).send("كلمة المرور مطلوبة");
    const user = req.user as any;
    const dbUser = await storage.getUser(user.id || user._id);
    if (!dbUser || !dbUser.password) return res.status(401).send("فشل في التحقق من الحساب");
    const { scrypt, timingSafeEqual } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);
    const parts = dbUser.password.split(".");
    if (parts.length === 2) {
      const [hashedPassword, salt] = parts;
      const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
      if (timingSafeEqual(Buffer.from(hashedPassword, "hex"), buffer)) return res.json({ success: true });
    } else if (dbUser.password === password) return res.json({ success: true });
    res.status(401).send("كلمة المرور غير صحيحة");
  });

  app.post(api.orders.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    if (parsed.data.paymentMethod === "wallet" && parsed.data.userId) {
      const user = await storage.getUser(parsed.data.userId);
      if (user) {
        const balance = Number(user.walletBalance || 0);
        const orderTotal = Number(parsed.data.total);
        if (balance < orderTotal) return res.status(400).json({ message: "رصيد المحفظة غير كافٍ" });
        await storage.updateUserWallet(user.id, (balance - orderTotal).toString());
        await storage.createWalletTransaction({
          userId: user.id,
          amount: orderTotal,
          type: "withdrawal",
          description: `دفع طلب POS #${new Date().getTime()}`,
        });
      }
    }
    const user = req.user as any;
    const order = await storage.createOrder({
      ...parsed.data,
      type: parsed.data.type || "online",
      branchId: parsed.data.branchId || user.branchId,
      cashierId: parsed.data.cashierId || user.id,
    });

    // Automatically generate invoice for the order
    try {
      await storage.createInvoice({
        userId: order.userId,
        orderId: order.id,
        invoiceNumber: `INV-${Date.now()}-${order.id.slice(-4).toUpperCase()}`,
        issueDate: new Date(),
        status: order.paymentStatus === "paid" ? "paid" : "issued",
        items: order.items.map((item: any) => ({
          description: item.title,
          quantity: item.quantity,
          unitPrice: item.price,
          taxRate: 15,
          taxAmount: Number((item.price * item.quantity * 0.15).toFixed(2)),
          total: Number((item.price * item.quantity * 1.15).toFixed(2)),
        })),
        subtotal: Number(order.subtotal),
        taxTotal: Number(order.vatAmount),
        total: Number(order.total),
        notes: `فاتورة مرتبطة بالطلب #${order.id.slice(-6).toUpperCase()}`
      });
    } catch (invErr) {
      console.error("[INVOICE] Failed to auto-generate invoice:", invErr);
    }

    res.status(201).json(order);
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin") return res.sendStatus(403);
    const { status, shippingProvider, trackingNumber } = req.body;
    const order = await storage.updateOrderStatus(req.params.id, status, { provider: shippingProvider, tracking: trackingNumber });
    res.json(order);
  });

  app.post("/api/verify-reset", async (req, res) => {
    const { phone, name } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }
    
    // Clean inputs for comparison
    const cleanPhone = phone.replace(/\D/g, "");
    const corePhone = cleanPhone.startsWith("0") ? cleanPhone.substring(1) : cleanPhone;
    
    console.log(`[RESET] Verifying user: Name="${name}", Phone="${phone}" (Core: "${corePhone}")`);
    
    const user = await UserModel.findOne({
      $and: [
        { name: { $regex: new RegExp(`^${name}$`, "i") } },
        { 
          $or: [
            { phone: corePhone },
            { phone: "0" + corePhone },
            { username: corePhone },
            { username: "0" + corePhone }
          ]
        }
      ]
    }).lean();

    if (!user) {
      console.log(`[RESET] Verification failed for: ${name} / ${phone}`);
      return res.status(404).json({ message: "المعلومات غير متطابقة" });
    }
    
    console.log(`[RESET] User verified: ${user._id}`);
    res.json({ id: user._id.toString() });
  });

  app.post("/api/reset-password", async (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) {
      return res.status(400).json({ message: "بيانات غير مكتملة" });
    }
    
    try {
      // Hash the new password before saving
      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);
      
      const salt = randomBytes(16).toString("hex");
      const buffer = (await scryptAsync(password, salt, 64)) as Buffer;
      const hashedPassword = `${buffer.toString("hex")}.${salt}`;
      
      console.log(`[RESET] Updating password for user: ${id}`);
      // Use UserModel directly to ensure immediate update with correct field names
      const result = await UserModel.findByIdAndUpdate(id, { 
        password: hashedPassword,
        mustChangePassword: false 
      }, { new: true });

      if (!result) {
        return res.status(404).send("المستخدم غير موجود");
      }
      
      res.json({ message: "تم تحديث كلمة المرور بنجاح" });
    } catch (err: any) {
      console.error(`[RESET] Error updating password:`, err);
      res.status(500).send("فشل تحديث كلمة المرور");
    }
  });

  // Audit Logs
  app.get("/api/admin/audit-logs", checkPermission("staff.manage"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const logs = await storage.getAuditLogs(100);
    res.json(logs);
  });

  // Branches
  app.get("/api/branches", async (_req, res) => {
    const branches = await storage.getBranches();
    res.json(branches);
  });

  app.post("/api/admin/branches", checkPermission("settings.manage"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const branch = await storage.createBranch(req.body);
    res.status(201).json(branch);
  });

  app.patch("/api/admin/branches/:id", checkPermission("settings.manage"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const branch = await storage.updateBranch(req.params.id, req.body);
    res.json(branch);
  });

  // Cash Shifts
  app.get("/api/pos/shifts/active", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const shift = await storage.getActiveShift(user.id || user._id);
    res.json(shift || null);
  });

  app.post("/api/pos/shifts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const shift = await storage.createCashShift({
      ...req.body,
      cashierId: user.id || user._id,
      openedAt: new Date(),
      status: "open"
    });
    res.status(201).json(shift);
  });

  // Staff Management
  app.get("/api/admin/users", checkPermission("staff.manage"), async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.post("/api/admin/users", checkPermission("staff.manage"), async (req, res) => {
    try {
      const userData = req.body;
      let phone = (userData.phone || "").replace(/\D/g, "");
      if (phone.startsWith("0")) phone = phone.substring(1);
      const email = userData.email || `${phone}@genmz.com`;
      const username = userData.username || phone;

      const existingUser = await storage.getUserByUsername(phone);
      if (existingUser) {
        if (existingUser.role !== "customer" && existingUser.role !== "admin") {
           return res.status(400).send("مستخدم بهذا الرقم موجود بالفعل كـ " + existingUser.role);
        }
        const updatedUser = await storage.updateUser(existingUser.id, {
          ...userData,
          role: userData.role || "employee",
          isActive: true
        });
        return res.json(updatedUser);
      }

      const { scrypt, randomBytes } = await import("crypto");
      const { promisify } = await import("util");
      const scryptAsync = promisify(scrypt);
      const defaultPassword = "2030";
      const salt = randomBytes(16).toString("hex");
      const buffer = (await scryptAsync(defaultPassword, salt, 64)) as Buffer;
      const hashedPassword = `${buffer.toString("hex")}.${salt}`;

      const user = await storage.createUser({
        ...userData,
        phone,
        email,
        username,
        password: hashedPassword,
        walletBalance: "0",
        mustChangePassword: true,
        isActive: true,
        role: userData.role || "employee",
        addresses: [],
        permissions: userData.permissions || []
      });
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).send(err.message);
    }
  });

  app.patch("/api/admin/users/:id", checkPermission("staff.manage"), async (req, res) => {
    const user = await storage.updateUser(req.params.id, req.body);
    res.json(user);
  });

  app.delete("/api/admin/users/:id", checkPermission("staff.manage"), async (req, res) => {
    await storage.deleteUser(req.params.id);
    res.sendStatus(200);
  });

  // Roles
  app.get("/api/admin/roles", checkPermission("staff.manage"), async (_req, res) => {
    const roles = await storage.getRoles();
    res.json(roles);
  });

  app.post("/api/admin/roles", checkPermission("staff.manage"), async (req, res) => {
    const role = await storage.createRole(req.body);
    res.status(201).json(role);
  });

  app.patch("/api/pos/shifts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const shift = await storage.updateCashShift(req.params.id, req.body);
    res.json(shift);
  });

  // Invoices
  app.get("/api/invoices", checkPermission("reports.view"), async (req, res) => {
    const user = req.user as any;
    const invoices = await storage.getInvoices(user.role === "admin" ? undefined : user.id);
    res.json(invoices);
  });

  app.get("/api/invoices/:id", async (req, res) => {
    const invoice = await storage.getInvoice(req.params.id);
    if (!invoice) return res.status(404).send("Invoice not found");
    res.json(invoice);
  });

  // Categories
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post("/api/categories", checkPermission("settings.manage"), async (req, res) => {
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  });

  app.patch("/api/categories/:id", checkPermission("settings.manage"), upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const updateData: any = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.slug) updateData.slug = req.body.slug;
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      updateData.image = req.body.image;
    }
    const { CategoryModel } = await import("./models");
    const category = await CategoryModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ ...category, id: (category as any)._id.toString() });
  });

  app.delete("/api/categories/:id", checkPermission("settings.manage"), async (req, res) => {
    await storage.deleteCategory(req.params.id);
    res.sendStatus(204);
  });

  // External API Stubs
  app.post("/api/payments/tamara/checkout", async (_req, res) => {
    res.json({ success: true, checkoutUrl: "https://tamara.co/checkout/stub", message: "Tamara integration stubbed" });
  });

  app.post("/api/payments/tabby/checkout", async (_req, res) => {
    res.json({ success: true, checkoutUrl: "https://tabby.ai/checkout/stub", message: "Tabby integration stubbed" });
  });

  app.post("/api/shipping/storage-station/create-order", checkPermission("orders.edit"), async (_req, res) => {
    res.json({ success: true, trackingNumber: "SS-" + Math.random().toString(36).substring(7).toUpperCase(), message: "Storage Station B20 stubbed" });
  });

  return httpServer;
}
