const adminisLoginOut = async (req, res, next) => {

    try {

        if (!req.session.admin) {
            next()
        }else{
            res.redirect('/admin/dashbord')
        }
        
    }

    catch (err) {
        console.log(err.message);
    }

}

const adminisLogin = async (req, res, next) => {

    try {

        if (req.session.admin) {
            next()
        }else{
            res.redirect('/admin/login')
        }
        
    }

    catch (err) {
        console.log(err.message);
    }

}


module.exports= {
adminisLogin,
adminisLoginOut
}