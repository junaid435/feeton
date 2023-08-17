
const UserisLogin = async (req, res, next) => {

    try {

        if (req.session.userid) {
            res.redirect('/profile')
        } else {
            next()
        }

    }

    catch (err) {
        console.log(err.message);
    }

}

const UserisLoginOut = async (req, res, next) => {

    try {

        if (req.session.userid) {
            next()
        } else {
            res.redirect('/login')
        }

    }

    catch (err) {
        console.log(err.message);
    }

}



module.exports = {
    UserisLogin,
    UserisLoginOut,

}

