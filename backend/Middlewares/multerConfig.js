const multer = require("multer");

// Configuration de Multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage(); // Stocke le fichier en mémoire sous forme de Buffer

// Configuration de Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite la taille du fichier à 5 Mo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) { // Accepter uniquement les types MIME commençant par "image/"
      cb(null, true); // Accepter le fichier
    } else {
      cb(new Error("Seules les images sont autorisées !"), false); // Rejeter le fichier
    }
  },
});

module.exports = upload;