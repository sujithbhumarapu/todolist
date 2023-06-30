//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");

const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sujithbhumarap:Maruthi248@cluster0.eqe6lp4.mongodb.net/todolistDB" ,{useNewUrlParser: true});
const itemsSchema=mongoose.Schema({
  name:String
});
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"welcome to to do list"
});
const item2=new Item({
  name:"hit + to add item"
});
const item3=new Item({
  name:"<-- Hit to delete an item"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]

};
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  Item.find().then(function(foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems);
      res.redirect("/");

    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});

    }
    

  });



  

});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function(foundList){
    if(!foundList){
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
      
    }
    else{
      res.render("list",{listTitle: customListName, newListItems: foundList.items});
    }
  })
  
  
})
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
    

  }
  else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });

  }
  
 

  
});
app.post("/delete",function(req,res){
  const checkedItem=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem).then(function(found){
      console.log("Deleted");
    });
    res.redirect("/");

  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}}).then(function(pull){
      console.log("Deleted");
    });
    res.redirect("/"+listName);
  }
  
  
  
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.POST || 3000, function() {
  console.log("Server started on port 3000");
});

