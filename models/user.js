import mongoose from "mongoose";
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Métricas do jogador que o projeto pede
    pontuacao: { type: Number, default: 0 },
    respostasEncontradas: { type: Number, default: 0 },
    respostasErradas: { type: Number, default: 0 },
    tempoTotalJogo: { type: Number, default: 0 },
    imagemPerfil: { type: String, default: "default.png" } // Link da imagem
});

export default model("User", userSchema); // Exporta o modelo para usarmos no Controller