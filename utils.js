import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


/* export const hashPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}
 */

const SECRET_KEY = process.env.PRIVATE_KEY;

/* usar provate key */

const hashPassword = (password) => {
    return bcrypt.hashSync(password, SECRET_KEY, null);
}

const isValidPassword = (password, userPassword) => {
    const result = bcrypt.compareSync(password, userPassword);
    return result;
}

const generateToken = (user) => {
    const token = jwt.sign({data: user}, SECRET_KEY, { expiresIn: '1h' }); //! Generate a token
    return token; 
};

const verifyToken = (token) => new Promise((resolve, reject) => { //! Verify a token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
           return reject(err);
        }
        resolve(decoded.data);
    });
});

export { hashPassword, isValidPassword, generateToken, verifyToken };