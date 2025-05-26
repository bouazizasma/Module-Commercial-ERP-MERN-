const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");

const signup = async (req, res) => {
    try {
        console.log(req.body);
        const { name, email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409)
                .json({ message: 'Utilisateur existe deja', success: false });
        }
        const userModel = new UserModel({ name, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        res.status(201)
            .json({
                message: "Utilisateur créé avec succès",
                success: true
            })
    } catch (err) {
        res.status(500)
            .json({
                message: "Internal server error",
                success: false,
                error: err.message 
            })
    }
}
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        const errorMsg = 'Email ou mot de passe incorrect';
        if (!user) {
            return res.status(401) // 401 Unauthorized est plus approprié que 403 Forbidden
                .json({ message: errorMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(401)
                .json({ message: errorMsg, success: false });
        }
        
        
        const expiresIn = '1h'; 
        const jwtToken = jwt.sign(
            { 
                email: user.email, 
                _id: user._id,
                name: user.name 
            },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        
        const expiresInMs = 3600 * 1000; 
        const tokenExpiration = Date.now() + expiresInMs;

        res.status(200)
            .json({
                message: "Connexion réussie",
                success: true,
                jwtToken,
                name: user.name,
                email: user.email,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                },
                expiresIn: 3600, 
                tokenExpiration 
            })
    } catch (err) {
        console.error("Login error:", err);
        res.status(500)
            .json({
                message: "Erreur serveur interne",
                success: false,
                error: err.message 
            })
    }
}
const lister = async (req, res) => {
    try {
        const users = await UserModel.find({}, { password: 0 }); 
        res.status(200).json(users);
    } catch (error) {
        console.error("List users error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des utilisateurs",
            error: error.message
        });
    }
}
module.exports = {signup,login,lister,};