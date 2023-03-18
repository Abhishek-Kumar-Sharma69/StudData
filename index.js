const express=require("express");
const bodyParser=require("body-parser");
const ejs=require('ejs');
const mongoose=require("mongoose");

const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/stud');
}
mongoose.connection.on("connected", () => {
    console.log("Connected to database");
});
mongoose.connection.on("error", (err) => {
  console.log("Database error:" + err);
}); 

const SubjectSchema=new mongoose.Schema ({
  Subjects:[String],
  total:[Number]
});
const marks=new mongoose.Schema({
  key:String,
  Marks:[Number]
})
const Subject=mongoose.model('Subject',SubjectSchema);
 const studentSchema=new mongoose.Schema({
    Name:{type:String, required:true},
    Registration_Num:{type:String,required:true},
    Batch:{type:String,required:true},
    Semester:{type:Number,required:true},
    subNames:[String],
    Marks:[Number],
    total:[Number],
    Percentage:Number
 });
 const Student=mongoose.model('Student',studentSchema);

//  Subject.deleteMany({}).then(function(){
//   console.log("data deleted");
//  });
//  Student.deleteMany({}).then(function(){
//   console.log("data deleted");
//  });

app.post('/marks/:customlistname',async function(req,res){
  const regno=req.params.customlistname;
  await Student.updateOne({Registration_Num:regno},{Marks:req.body.Marks});
  const detail=await Student.findOne({Registration_Num:regno});
  let sum=0,tot=0;
  (detail.Marks).forEach(function(e){
      sum=sum+e;
  })
const arr=detail.total;
  arr.forEach(function(e){
    tot=tot+e;
 })
  const p=(sum/tot)*100;
  
  await Student.updateOne({Registration_Num:regno},{Percentage:p.toFixed(2)});
   res.redirect("/find/"+regno);
  })
 app.get('/marks/:customlistname',async function(req,res){
  const regno=req.params.customlistname;
  const sub=await Subject.find({});
  console.log(sub[0].Subjects);
  await Student.updateOne({Registration_Num:regno},{subNames:sub[0].Subjects,total:sub[0].total});
 const detail=await Student.findOne({Registration_Num:regno});
  res.render('marksform',{Reg:regno,det:detail})
})
app.post('/submarks',async function(req,res){
  const getregnum=req.body.regno;
  res.redirect('/marks/'+getregnum);
})
 app.get('/submarks',async function(req,res){
  const List=await Student.find({})    
    res.render('submarks',{datalist:List});
})

 app.get('/subform', async function(req,res){
  const sub=await Subject.find({});
  var message="";
  if(sub.length > 0){
  message="The Subjects present are :-";
  }
 else{
  message="NO subject is present add Subject";

 }
      res.render('subform',{subj:sub[0],flag:(sub.length > 0),message:(message)})
 })

 app.post('/subform',async function(req,res){
      const subn=req.body.subName;
      const tot=req.body.total;
      
        const f=await Subject.find({});
        if(!(f && f.length))
  {
      const make=new Subject({
        Subjects:[subn],
        total:[tot]
      })
      make.save();
  }
  else
  {
    const farr=f[0];
    farr.Subjects=(f[0].Subjects).concat(subn);
    f[0].Subjects=farr.Subjects;
    farr.total=(f[0].total).concat([tot]);
    f[0].total=farr.total;
    const s=await Subject.updateOne({},{Subjects:farr.Subjects,total:farr.total});
  }
    
        res.redirect('/subform');
      
      
 })
 
app.get('/add',function(req,res){
    res.render('addform');
})

app.post('/add',async function(req,res){
  const sName=req.body.Name;
   const sReg=req.body.Registration_Num;
   const batch=req.body.Batch;
   const sem=req.body.Semester;
   var checkdata=[await Student.findOne({Registration_Num:sReg.toUpperCase()})];
   if(checkdata[0])
   {
    res.render('msg',{mesg:"failure",err:"member already present"});
   }
   else{
  try {
    const newst=new Student({
      Name:sName,
      Registration_Num:sReg.toUpperCase(),
      Batch:batch,
      Semester:sem,
    });
    newst.save();
   res.render('msg',{mesg:"success",err:""});
  } catch (error) {
    console.log(error);
    res.render('msg',{mesg:"failure",err:error});
  } 
}
})
 app.get('/find/:customlistname',async function(req,res){
    const custlistname=req.params.customlistname;
   
    const reqdata=[await Student.findOne({Registration_Num:custlistname.toUpperCase()})];
    console.log(reqdata);
    res.render('singlemain',{datalist:reqdata});
    
 })
app.get('/',async function(req,res){
 
    const List=await Student.find({}) 
    const f=await Subject.find({});
    
        if(f.length > 0)
  {
    await Student.updateMany({},{subNames:f[0].Subjects,total:f[0].total})
  }   
    res.render('main',{datalist:List});    
})

app.post('/',function(req,res)
{
   const searchRoll=req.body.roll;
   res.redirect('/find/'+searchRoll);
});

app.listen(3000,()=>{
    console.log("listening to port 3000");
});