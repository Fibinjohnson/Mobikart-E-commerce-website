

function addToCart(id) {
    console.log("started")
    $.ajax({
      url: "/Add-Products-Cart/" + id,
      type: "get",
      success: (response)=> {
        if(response.status){
            let count=$("#cartCount").html();
            count=parseInt(count)+1;
            $("#cartCount").html(count)
        }
        

      },
    });
    console.log("ended")
  }


   async function changeQuantity(Cartid,productId,count){
       let  quantity=parseInt(document.getElementById(productId).innerHTML)
       count=parseInt(count)
       
       await $.ajax( 
    
      {
       url:"/change-quantity",
       data:{
         cart:Cartid,product:productId,count:count,quantity:quantity
       },
       type:"POST",
       success:(response)=>{
        if(response.removeStatus){
          alert("product removed"),
          location.reload()
         
        }else{
          document.getElementById(productId).innerHTML=quantity+count;
        }
        
       }
      }
    )
  }
  function remove(cartId,productId){
  
$.ajax(
  {
    url:"/remove",
    data:{cartId:cartId,
    productId:productId},
    type:"post",
    success:(response)=>{location.reload()}
  }
)

  }
  
