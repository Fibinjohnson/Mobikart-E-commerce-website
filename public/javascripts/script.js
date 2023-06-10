

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


  function changeQuantity(Cartid,productId,count){
       
    $.ajax( 
    
      {
       url:"/change-quantity",
       data:{
         cart:Cartid,product:productId,count:count
       },
       type:"post",
       success:(response)=>{
        console.log(response.status,"status")
       }

      }
    )


}
  
