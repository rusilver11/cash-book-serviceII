import jwt from "jsonwebtoken";

export const VerifyToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(token == null) return res.status(404).send({message:"Auth token needed"});

    jwt.verify(token, `${process.env.ACCESS_TOKEN_SECRET}`, (err, decoded) => {
        if(err) return res.status(404).send({message:"Invalid or expired token"});
        req.phone = decoded.phone;
        next();
    })
}