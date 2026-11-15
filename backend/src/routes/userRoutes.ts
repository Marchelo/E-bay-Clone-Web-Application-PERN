import { Router } from "express";
import { syncUser } from "../controllers/userController"; // samo jedna metoda se koristi pa ovako importujes
import { requireAuth } from "@clerk/express";

const router = Router();

// POST => /api/users/sync (PROTECTED ROUTE) - sync the Clerk user to DB ako je korisnik ulogovan, Clerk ce mu dati auth obj koji sadrzi userId i email, a to ce se koristiti za sync sa bazom
    // protected koristis requireAuth()
router.post("/sync", requireAuth(), syncUser)    // u index imas vec /api/users kad mu se doda ovo samo ce postati /api/users/sync



export default router;