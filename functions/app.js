import "./database.js";

import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import qrcode from "qrcode";

import { UserModel } from "./models.js";

export const app = express();

app.use(express.json());

app.get("/api/hello",(req,res) =>{
  res.send({message:"Hello World!"});
});


app.post("/api/register", async (req, res) => {
  
    const { name, email, password } = req.body;


    if (!name) {
      return res.status(400).send({ message: "Name is required" });
    }

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required" });
    }
const existingUser  = await UserModel.findOne({email});
  if (existingUser)
    return res.status(400).send({ message: "user already exists" });
  try { 
    await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password, 10),
    });

    res.send({ message: "User successfully registered" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
});


app.post("/api/login", async (req, res) => {
  try{
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: "Invalid password" });
    }

    const isPasswordValid = await bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({ error: "Invalid password" });
    }
    const token = jwt.sign(
      {
        userId: user.id.ioString(),
      },
      process.env.JWT_SECRET
    );
    res.send({
      name:user.name,
      email:user.email,
      token,
    });

    
    res.send({ message: "Login successful" });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
  
});
app.use("/api", async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(400).send({ message: "Token is required!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(400).send({ message: "Invalid token!" });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Failed to verify token", error);
    return res.status(400).send({ message: "Invalid token!", error });
  }
});



app.get("/api/qrcode", async (req, res) => {
  try {
    if (!req.query.text) {
      return res.send({ message: "Text is required!" });
    }

    const imageUrl = await qrcode.toDataURL(req.query.text, {
      scale: 15,
    });

    res.send({ imageUrl });
  } catch (error) {
    console.error("Failed to generate QR", error);
    res.send({ message: "Failed to generate QR!", error });
  }
});
