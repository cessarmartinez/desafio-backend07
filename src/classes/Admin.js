class Admin{
    static isAdmin = false;

    handleAdminStatus(){
        this.isAdmin = !this.isAdmin
        return this.isAdmin
    }
}

module.exports= {Admin};
