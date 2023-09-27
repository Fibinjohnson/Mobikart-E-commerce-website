
function addToCart(id) {
  $.ajax({
    url: "/Add-Products-Cart/" + id,
    type: "get",
    success: (response) => {
      if (response.status) {
        // let count = $("#cartCount").html();
        // count = parseInt(count) + 1;
        // console.log(count)
        // $("#cartCount").html(count);
        location.reload()
       
      }
    },
  });
}

function remove(cartId, productId) {
  $.ajax({
    url: "/remove",
    data: {
      cartId: cartId,
      productId: productId
    },
    type: "post",
    success: (response) => {
      location.reload();
    }
  });
}
  $('#checkOutPay').submit((e)=>{
    e.preventDefault();
    $.ajax({
      url:"/placeOrder",
      data:$('#checkOutPay').serialize(),
      type:"post",
      success:((response)=>{
        alert(response)
      })
    })
  })

  
