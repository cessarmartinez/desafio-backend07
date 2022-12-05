const {Contenedor} = require("./classes/Contenedor")
const {Chat} = require("./classes/Chat")
const {Cart} = require("./classes/Cart")
const {Admin} = require("./classes/Admin")


const express = require("express");
const { Server } = require("socket.io");

const exhbs = require("express-handlebars")
const path = require("path")


const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT,()=>console.log(`Servidor ON en puerto ${PORT}`));

app.use(express.static("public"));

const io = new Server(server)

app.use(express.urlencoded({extended:true}));
app.use(express.json());

const productsRouter = express.Router();
const cartRouter = express.Router();
app.use("/api/productos",productsRouter)
app.use("/api/carrito",cartRouter)

app.engine("handlebars",exhbs.engine({defaultLayout:"main"}))
const viewFolder = path.join(__dirname,"views")
app.set("views",viewFolder)
app.set("view engine", "handlebars")

let products = new Contenedor;
const chat = new Chat;
const cart = new Cart;

let productList= Contenedor.productsList;

io.on("connection",(socket)=>{

    io.sockets.emit("productListToClient",productList)

    socket.on("message",(data)=>{
        chat.addMessage(data)
        io.sockets.emit("messagesListToClient",Chat.messagesList)
    })
})

app.get("/",(req,res)=>{
    res.render("form")
})

app.get("/productos",async (req,res)=>{
    if(await productList==false){
        res.render("products",{
            error:"Nothing Yet",
            image:'<img src="images/nothingList.svg" alt="nothing in the list">'
        })
    }else{
        res.render("products",{
            products:productList
        })
    }
})

cartRouter.post("/",async (req,res)=>{
    await cart.createCart();
    res.send({success:`Cart labeled with id: ${Cart.id} added.`})
})

cartRouter.delete("/:id",async (req,res)=>{
    let id = parseInt(req.params.id);
    let deletedCart = await cart.getById(id);

    if (deletedCart.length != 0){
        await cart.deleteCartById(id)
        res.send({success:`Cart labeled with id: ${id} deleted.`})
    }else{
        res.send({error:`Cart labeled with id: ${id} does not exists.`})  
    }
})

cartRouter.get("/:id/productos",async(req,res)=>{
    let id = parseInt(req.params.id);
    let cartSelectedArray = await cart.getById(id);
    let cartSelectedObject = cartSelectedArray[0]

    if (cartSelectedArray.length != 0){
        res.send({"Cart":`${id}`,
                  "Products added in cart": cartSelectedObject.products})
    }else{
        res.send({error:`Cart labeled with id: ${id} does not exists.`})  
    }
})

cartRouter.post("/:id/productos", async(req,res)=>{
    let cartId = parseInt(req.params.id);
    let cartSelectedArray = cart.getById(cartId)
    let cartSelectedObj = cartSelectedArray[0]
    let cartSelectedProductsArray = cartSelectedObj.products

    let idProduct = parseInt(req.body.id);
    let productSelectedArray = products.getById(idProduct)
    let productSelectedObj = productSelectedArray[0]

    if (cartSelectedArray.length != 0 && productSelectedArray.length != 0){
            cartSelectedProductsArray.push(productSelectedObj)
            res.send({success:`Product with id: ${idProduct} added to cart ${cartId}`}) 
    }else{

            res.send({error:"No product was selected. It may not exist. Check body of request is 'id':'number'"}) 
    }
})

cartRouter.delete("/:id/productos/:id_prod", async(req,res)=>{
    let cartId = parseInt(req.params.id);
    let productId = parseInt(req.params.id_prod);

    let cartObjArray = cart.getById(cartId)
    let cartObj = cartObjArray[0]
    let cartProductsArray = cartObj.products

    if (cartObjArray.length == 0){
        res.send({error:`Cart labeled with id ${cartId} does not exists.`})
    }else if(cartProductsArray.length == 0){
        res.send({error:`Product labeled with id ${productId} is not in cart ${cartId}.`})
    }else{
        Cart.CartList[cartId-1].products = cart.deleteProductInCart(productId,cartProductsArray);
        res.send({success:`Product labeled with id  ${productId} in cart ${cartId} deleted.`});
    }
})

productsRouter.get("/",(req,res)=>{
    res.send(products.getAll())
})

productsRouter.get("/:id",(req,res)=>{
    let id = parseInt(req.params.id);
    product = products.getById(id);

    product == false ? 
    res.send({"error": "Product does not exist"}) :
    res.send(product);
})

productsRouter.post("/",(req,res)=>{
    const newProductObject = req.body;

    if (newProductObject.name &&
        newProductObject.price &&
        newProductObject.thumbnail &&
        newProductObject.description &&
        newProductObject.code &&
        newProductObject.stock){

        products.save(newProductObject);
        res.redirect("/");

    }else{
        res.send({error:"Some of the fields are empty or wrong"})

    }
})

productsRouter.put("/:id", async (req,res)=>{
    const id = parseInt(req.params.id);
    const editProductObject = req.body;

    if (products.getById(id) == false){
        res.send({"error": "No hay producto para actualizar"});

    }else{
        if (editProductObject.name &&
            editProductObject.price &&
            editProductObject.thumbnail){

            await products.deleteById(id);
            products.update(productObject,id);
            products.sort();
            res.send({success:`Product labeled with id ${id} updated.`});

        }else{
            res.send({error:"Some of the fields are empty or wrong."});

        }
    } 
})

productsRouter.delete("/:id",(req,res)=>{
    const id = parseInt(req.params.id);
    const deleteProductObj = products.getById(id)
    if (deleteProductObj == false){
        res.send({error:`Product labeled with id ${id} does not exists.`})

    }else{
        products.deleteById(id);
        res.send({success:`Product labeled with id  ${id} deleted.`});

    }
})

app.get("*",(req,res)=>res.send({"error":"This path does not exists."}))