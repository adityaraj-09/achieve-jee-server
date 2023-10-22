


const checkGuard= async (req, res, next)=>{
    try {
       
        const authpass=req.header("AuthGuardPass")
        if (!authpass)
            return res.status(401).json({ msg: "No AuthGuardPass, access denied" });

         if(authpass!=process.env.AUTHGUARDPASS) {
            return res.status(401).json({ msg: "AuthGuardPass verification failed, authorization denied." });
         } 
         next() 
    } catch (error) {
       return res.status(500).json({ error: error.message }); 
    }

}


module.exports=checkGuard