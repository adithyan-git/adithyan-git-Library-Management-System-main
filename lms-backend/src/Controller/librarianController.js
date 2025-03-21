const borrowBook = require("../Models/borrowBooksSchema");
const fineDetails = require("../Models/fineSchema");
const renewRequests = require("../Models/renewBookRequests");
const newBookRequest = require("../Models/newBookRequestSchema");



exports.vewRenewalRequest = async (req,res)=>{

    const renewalRequests = await renewRequests.find();

    if(!renewalRequests){
        return res.status(404).json({
            success:false,
            message:'renewal requests are empty'
        });
    }

    return res.status(200).json({
        success:true,
        message:'renewal requests  displayed',
        renewalRequests
    })
}
exports.acceptRenewRequestandUpdateBorrowingDetails = async (req,res)=>{

    const userId = req.params.id;
    
    const {email,registernumber,duedate,extendingdate,status} = req.body;

    if(!email || !registernumber || !duedate || !extendingdate || !status){
        return res.status(400).json({
            status:false,
            message:'must fill all fields'
        });
    }

    if(!userId){
        return res.status(400).json({
            success:false,
            message:'no user id'
        });
    }

  

    try {
        const findedUser = await renewRequests.findById(userId);
        
        
    if(!findedUser){
        return res.status(404).json({
            success:false,
            message:'user not found'
        });
    }

   if(findedUser.registernumber !== registernumber){
        return res.status(400).json({
            success:false,
            message:'invalid register number,please check the register number'
        });
    }

    const borrowedUsers = await borrowBook.find();
    
    const sameEmailUser = borrowedUsers.filter((user)=>user.registerid === findedUser.registerid); 
       
    const sameBookname = sameEmailUser.find((user)=>user.bookname === findedUser.bookname);
  
    
    
    if(sameBookname){
        if(status === 'approved'){

            sameBookname.expirestatus = 'nothing'
            sameBookname.duedate = extendingdate
            sameBookname.renewstatus = status
            sameBookname.save()

        }else if(status === 'rejected'){            
            sameBookname.renewstatus = status
            sameBookname.save()
        }

        findedUser.status = status
        findedUser.save()
    }

   

    return res.status(200).json({
            success:true,
            message:'renewBorrowing request accept and update borrowing request  successfully completed'
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}
exports.sendNewBookRequest = async (req,res)=>{

    const {librarianName,bookName,author,howmanyCopies,date} = req.body;

    if(!librarianName || !bookName || !author || !howmanyCopies || !date){
        return res.status(400).json({
            success:false,
            message:'must fill all fields'
        });
    }

    try {
        const newBookDetails = await newBookRequest.create({
            librarianName,
            bookName,
            author,
            howmanyCopies,
            date
        });
    
        return res.status(201).json({
            success:true,
            message:'you are successfully send newbook'
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}
exports.deleteAcceptedRenewalRequests = async (req,res)=>{

    const renewalId = req.params.id;

    if(!renewalId){
        return res.status(400).json({
            success:false,
            message:'no renewal id'
        });
    }

    const deletedRenewalRequest = await renewRequests.findByIdAndDelete(renewalId) 

    if(!deletedRenewalRequest){
        return res.status(404).json({
            success:false,
            message:'user not found deletion faild'
        })
    }

    return res.status(200).json({
        success:true,
        message:'deletion successfully completed '
    })
}
exports.fineRecieved = async (req,res)=>{

    const userFineId = req.params.id;

    if(!userFineId){
        return res.status(400).json({
            success:false,
            message:'no userfine id'
        });
    }

    try {

        const findedUser = await fineDetails.findById(userFineId);

    if(!findedUser){
        return res.status(404).json({
            success:false,
            message:'user not found'
        });
    }

    findedUser.status = "Recieved" ;
    findedUser.save();

    return res.status(200).json({
        success:true,
        message:'you are successfully recieved fine amount'
    }); 
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }  
}






