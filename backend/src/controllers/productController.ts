import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// razlika kad uzimam iz req.body i req.params? 
    // req.body se koristi za podatke koje salje korisnik u telu zahteva (npr. JSON)
    // req.params se koristi za dinamicka polja u URL-u (npr. /products/123)

// GET all products (public)
export async function getAllProducts(req:Request, res:Response) {
    try {
        const products = await queries.getAllProducts();
        res.status(200).json(products);

    } catch (error) {
        console.error("Error getting products: " + error);
        res.status(500).json({error:"Failed to get products!"});
    }
}

// GET a single product by ID (public)
export async function getProductById(req:Request, res:Response) {
    try {
        // ovde u productRoutes router.get("/:id", productController.getProductById);
        // ono sto imas ovde "/:id" je isto sto ces dobiti ovde dole u { id }
        const { id } = req.params;

        if (typeof id !== "string")
            return res.status(400).json({error:"Invalid product ID!"});

        const product = await queries.getProductById(id);

        if(!product)
            return res.status(404).json({error:"Product not found!"});

        res.status(200).json(product);
    } catch (error) {
        console.error("Error getting product: " + error);
        res.status(500).json({error:"Failed to get product!"});
    }
}

// GET products by current user (protected)
export async function getMyProducts(req:Request, res:Response) {
    try {
        const { userId } = getAuth(req);
        if(!userId) 
            return res.status(401).json({error: "Unauthorized!"});
        
        const products = await queries.getProductsByUserId(userId);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error getting user products: " + error);
        res.status(500).json({error:"Failed to get user products!"});
    }
}

// CREATE product (protected) 
export const createProduct = async(req:Request, res:Response) => {
    try {
        const { userId } = getAuth(req);
        if(!userId)
            return res.status(400).json({error:"Unauthorized!"});

        const { title, description, imageUrl } = req.body;

        if(!title || !description || !imageUrl){
            res.status(400).json({error:"Title, description and imageUrl are required"});
            return;
        }

        const product = await queries.createProduct({
            title,
            description,
            imageUrl,
            userId
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("Error creating product: ", error);
        res.status(500).json({error:"Failed to create product!"});
    }
}

// UPDATE product (protected - owner only)
export const updateProduct = async (req:Request, res:Response) => {
    try {
        const { userId } = getAuth(req);
        if(!userId)
            return res.status(400).json({error:"Unauthorized!"});

            // req.body se koristi za podatke koje salje korisnik u telu zahteva (npr. JSON)
            // req.params se koristi za dinamicka polja u URL-u (npr. /products/123)
        const { id } = req.params;
        const { title, description, imageUrl } = req.body;

        if (typeof id !== "string")
            return res.status(400).json({error:"Invalid product ID!"});

        // proveri da li product pripada tom korisniku
        const existingProduct = await queries.getProductById(id);
        if (!existingProduct) {
            return res.status(404).json({error:"Product not found"});
        }

        if(existingProduct.userId !== userId){
            return res.status(403).json({ error: "YOu can only update your own products!"});
        }

        const product = await queries.updateProduct(id, {
            title,
            description,
            imageUrl
        });
        res.status(200).json(product);
    } catch (error) {
        console.error("Error updating product: ", error);
        res.status(500).json({error:"Failed to update product!"}); 
    }
}

// DELETE product (protected - owner only)
export const deleteProduct = async (req:Request, res:Response) => {
    try {
        const { userId } = getAuth(req);
        if(!userId)
            return res.status(400).json({error:"Unauthorized!"});

        const { id } = req.params;
        
        if (typeof id !== "string")
            return res.status(400).json({error:"Invalid product ID!"});

        // proveri da li product pripada tom korisniku
        const existingProduct = await queries.getProductById(id);
        if (!existingProduct) {
            return res.status(404).json({error:"Product not found"});
        }
            // existingProduct.userId - baza        userId - ulogovani
        if(existingProduct.userId !== userId){
            return res.status(403).json({ error: "YOu can only update your own products!"});            
        }

        await queries.deleteProduct(id);
        res.status(200).json({message:"Product deleted successfully!"})

    } catch (error) {
        console.error("Error deleting product: ", error);
        res.status(500).json({error:"Failed to delete product!"});        
    }
}