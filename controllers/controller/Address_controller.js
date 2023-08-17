const   user_address= require('../../models/Address_Model')


const loadAddress =async(req,res,next)=>{
    try {
          res.render('userAddress')
    } catch (err) {
        next(err)
    }
}

const addAddress = async (req,res,next) => {
    try {

        const userId = req.session.userid;

        const address = await user_address.findOne({ user: userId });

        if (address) {
            await user_address.updateOne(
                { user: userId },
                {
                    $push: {
                        address: {
                            fname: req.body.firstName,
                            sname: req.body.lastName,
                            mobile: req.body.phone,
                            email: req.body.email,
                            housename: req.body.address1,
                            city: req.body.address2,
                            state: req.body.address3,
                            district: req.body.address4,
                            country: req.body.address5,
                            pin: req.body.pincode
                        }
                    }
                }
            );
        } else {
            const newAddress = new user_address({
                user: userId,
                address: [{
                    fname: req.body.firstName,
                    sname: req.body.lastName,
                    mobile: req.body.phone,
                    email: req.body.email,
                    housename: req.body.address1,
                    city: req.body.address2,
                    state: req.body.address3,
                    district: req.body.address4,
                    country: req.body.address5,
                    pin: req.body.pincode
                }]
            });
            await newAddress.save();
        }

        res.redirect('/profile');
    } catch (err) {
       next(err);
    }
}


const loadEditAddress=async(req,res,next)=>{
    try {
        const address_id=req.query.id
    
        const id = req.session.userid

        const addressdata = await user_address.findOne({ user: id }, { address: { $elemMatch: { _id: address_id } } });
        res.render('edit_Address', { address: addressdata.address[0]})
    
    } catch (err) {
        next(err)
    }
}


const loadAddressCart =async(req,res,next)=>{
    try {
          res.render('userAddressCart')
    } catch (err) {
        next(err)
    }
}


const   addAddressCart = async (req, res) => {
    try {

        const userId = req.session.userid;

        const address = await user_address.findOne({ user: userId });

        if (address) {
            await user_address.updateOne(
                { user: userId },
                {
                    $push: {
                        address: {
                            fname: req.body.firstName,
                            sname: req.body.lastName,
                            mobile: req.body.phone,
                            email: req.body.email,
                            housename: req.body.address1,
                            city: req.body.address2,
                            state: req.body.address3,
                            district: req.body.address4,
                            country: req.body.address5,
                            pin: req.body.pincode
                        }
                    }
                }
            );
        } else {
            const newAddress = new user_address({
                user: userId,
                address: [{
                    fname: req.body.firstName,
                    sname: req.body.lastName,
                    mobile: req.body.phone,
                    email: req.body.email,
                    housename: req.body.address1,
                    city: req.body.address2,
                    state: req.body.address3,
                    district: req.body.address4,
                    country: req.body.address5,
                    pin: req.body.pincode
                }]
            });
            await newAddress.save();
        }

        res.redirect('/Proceed');
    } catch (err) {
       next(err);
    }
}

const EditAddress=async(req,res,next)=>{
    try {
      const id=  req.body.addressId
     const userId=req.session.userid
     await user_address.findOneAndUpdate({user:userId, address: { $elemMatch: { _id: id } } },{$set:{"address.$.fname":req.body.firstName,"address.$.sname":req.body.lastName,"address.$.mobile":req.body.phone,"address.$.email":req.body.email,"address.$.housename": req.body.address1,"address.$.city":req.body.address2,"address.$.state":req.body.address3,"address.$.district":req.body.address4,"address.$.country":req.body.address5,"address.$.pin": req.body.pincode}})
       res.redirect('/profile')
    } catch (err) {
       next(err)
    }
}

module.exports = {
    addAddress,
    loadAddress,
    loadEditAddress,
    loadAddressCart,
    addAddressCart,
    EditAddress
}