class Cart{
    static id=0;
    static CartList = [];

    createCart(){
        try{
            Cart.id++
            Cart.CartList.push({id: Cart.id,
                                timestamp: Date.now(),
                                products: [],
                            })
        }catch{
            return Error("Error at Cart.save(cart)")
        }
    }

    getById(id){
        try{
            const cartObjArray = Cart.CartList.filter(elm=>elm.id==id)
            return cartObjArray
        }catch{
            return Error("Error en Cart.getById(id)")
        }
    }

    deleteCartById(id){
        try{
            const CartListDeletedId = Cart.CartList.filter((elm)=>elm.id != id)
            Cart.CartList = CartListDeletedId;
        }catch{
            return Error("Error en Cart.deleteById(id)")
        }
    }

    deleteProductInCart(id,cartProductArray){
        const cartProductsArrayIdDeleted = cartProductArray.filter((elm)=>elm.id != id)
        return cartProductsArrayIdDeleted
    }
}

module.exports= {Cart};
