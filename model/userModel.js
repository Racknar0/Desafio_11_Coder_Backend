import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true }}
    , { timestamps: true }
);

export default mongoose.model('User', userSchema);  //! Expotart el modelo
