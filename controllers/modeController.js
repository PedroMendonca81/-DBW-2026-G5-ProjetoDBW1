
import currentUser from "../models/user.js";

export const getMode = (req, res) => {
    
    res.render('mode', { user: currentUser });
};
