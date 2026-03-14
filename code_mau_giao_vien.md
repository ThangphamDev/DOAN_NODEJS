global.__basedir = __dirname;
var bodyParser = require(&#39;body-parser&#39;)
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

- tạo file apps/Entity/ Product.js
class Product {
    _id;
    Name;
    Price;
    CategoryId;
    constructor() {
    }
}
module.exports = Product
- tạo file apps/Entity/Category.js
class Category {
    _id;
    Name;
    ParentId;
    constructor() {
    }
}
module.exports = Category;

- tạo tập tin Config/Setting.json
{
   &quot;mongodb&quot;:{
      &quot;username&quot;: &quot;&quot;,
      &quot;password&quot;: &quot;&quot;,
      &quot;database&quot;:&quot;database1&quot;
   }
}
- login vào mongodb: tạo database1
- tạo tập tin apps/Database/Database.js

var config = require(global.__basedir +  &quot;/Config/Setting.json&quot;);
class DatabaseConnection{
    url;
    user;
    pass;
    constructor(){
       
    }
    static  getMongoClient(){
        this.user = config.mongodb.username;
        this.pass = config.mongodb.password;
        this.url =
`mongodb+srv://${this.user}:${this.pass}@cluster0.md9aipa.mongodb.net/?retryWrite
s=true&amp;w=majority`;
//this.url =
&quot;mongodb://127.0.0.1:27017/?serverSelectionTimeoutMS=5000&amp;connectTimeoutMS=10000&quot;
;
        const { MongoClient } = require(&#39;mongodb&#39;);
        const client = new MongoClient(this.url);
        return client;
    }
   
}
module.exports = DatabaseConnection;
- luu ý: điềm chỉnh chuỗi kết nối cho phù hợp
- tạo tập tin apps/Repository/CategoryRepository.js
class CategoryRepository{
    context;
    session;
    constructor(context, session= null){
        this.context = context;
        this.session = session;
    }
    async insertCategory(category){
        var session  = this.session;
        return await
this.context.collection(&quot;category&quot;).insertOne(category,{session});
    }
}
module.exports = CategoryRepository;
- tạo tập tin apps/Repository/ProductRepository.js
var ObjectId  = require(&#39;mongodb&#39;).ObjectId;
class ProductRepository{
    context;
    session;
    constructor(context, session= null){

        this.context = context;
        this.session = session;
    }
    async insertProduct(product){
        var session  = this.session;
        return await
this.context.collection(&quot;product&quot;).insertOne(product,{session});
    }
    async updateProduct(product){
        var session  = this.session;
        return await this.context.collection(&quot;product&quot;).updateOne({&quot;_id&quot;: new
 ObjectId(product._id) }, {$set: product},{session});
    }
    async deleteProduct(id){
        var session  = this.session;
        return await this.context.collection(&quot;product&quot;).deleteOne({&quot;_id&quot;: new
ObjectId(id) },{session});
    }
    async getProduct(id){
        return await this.context.collection(&quot;product&quot;).findOne({&quot;_id&quot;: new
ObjectId(id) },{});
    }
    async getProductList(skip,take) {
        const cursor = await this.context.collection(&quot;product&quot;).find({},
{}).skip(skip).limit(take);
        return await cursor.toArray();
    }
}
module.exports = ProductRepository;

- tạo tập tin apps/Services/ProductService.js
var DatabaseConnection = require(global.__basedir +  &#39;/apps/Database/Database&#39;);
var Config = require( global.__basedir + &quot;/config/setting.json&quot;);
var ProductRepository = require(global.__basedir +
&quot;/apps/Repository/ProductRepository&quot;);
var CategoryRepository = require(global.__basedir +
&quot;/apps/Repository/CategoryRepository&quot;);
class ProductService{
    productRepository;
    categoryRepository;
    session;
    constructor(){
        this.client = DatabaseConnection.getMongoClient();
        this.session = this.client.startSession();
        this.database =  this.client.db(Config.mongodb.database);
        this.session.startTransaction();

        this.productRepository = new
ProductRepository(this.database,this.session);
        this.categoryRepository = new
CategoryRepository(this.database,this.session);
    }
    async insertProduct(product,category){
        try{
            var categoryResult = await
this.categoryRepository.insertCategory(category);
            product.CategoryId = categoryResult.insertedId;
            var result =  await this.productRepository.insertProduct(product);
            this.session.commitTransaction();
            this.session.endSession();
            return true;
        }catch(error){
            await this.session.abortTransaction();
            this.session.endSession();
            return false;
        }
    }
    async deleteProduct(id){
        var result =  await this.productRepository.deleteProduct(id);
        this.session.commitTransaction();
        this.session.endSession();
        return result;
    }
    async updateProduct(product){
        var result =  await this.productRepository.updateProduct(product);
        this.session.commitTransaction();
        this.session.endSession();
        return result;
    }
    async getProduct(id){
        return await this.productRepository.getProduct(id);
    }
    async getProductList() {
        var productList = await this.productRepository.getProductList(0,100);
        return productList;
    }
}
module.exports = ProductService;

- chỉnh sửa tập tin controllers/productmanagecontroller.js

var express = require(&quot;express&quot;);

var router = express.Router();
var ProductService = require(global.__basedir +  &quot;/apps/Services/ProductService&quot;);
var ObjectId = require(&#39;mongodb&#39;).ObjectId;
var Product = require(global.__basedir + &quot;/apps/Entity/Product&quot;);
var Category = require(global.__basedir + &quot;/apps/Entity/Category&quot;);
router.post(&quot;/insert-product&quot;, async function(req,res){
    var productService = new ProductService();
    var pro = new Product();
    pro.Name = req.body.Name;
    pro.Price = req.body.Price;
    var cate = new Category();
    cate.Name = &quot;category 1&quot;;
    var result =  await productService.insertProduct(pro, cate);
    res.json({status: true, message:&quot;&quot;});
});
router.get(&quot;/&quot;, function(req,res){
    res.render(&quot;admin/productmanage.ejs&quot;);
});
router.get(&quot;/product-list&quot;, async function(req,res){
    var productService = new ProductService();
    var product =  await productService.getProductList();
    res.json(product);
});
router.post(&quot;/update-product&quot;, async function(req,res){
    var productService = new ProductService();
    var pro = new Product();
    console.log(req.body.Id);
    pro._id = new ObjectId(req.body.Id);
    pro.Name = req.body.Name;
    pro.Price = req.body.Price;
    await  productService.updateProduct(pro);
    res.json({status: true, message:&quot;&quot;});
});
router.delete(&quot;/delete-product&quot;, async function(req,res){
    var productService = new ProductService();
    await  productService.deleteProduct(req.query.id);
    res.json({status: true, message:&quot;&quot;});
});

module.exports = router;