

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
  
