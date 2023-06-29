function validate(){
    var name=document.submit.name.value;
    var email=document.submit.email.value;
    var phone=document.submit.phone.value;
    var password=document.submit.password.value;
    var cpassword=document.submit.passwordconfirm.value;

    var reg = (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    var nameerror= (/^[A-Za-z]+$/);
    var phoneerror=(/^[0-9]{10}$/);
    var passworderror=(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/)
    var error=document.getElementById("error-message");
  
    if(name==""){
        error.innerHTML='Please enter your name'
        return false;
    }
    if(nameerror.test(name)==false){
      error.innerHTML='invalid name'
      return false;
  } 
  if(name.length<5){
       error.innerHTML='Name should contain atleast 5 elements'
        return false;
    }
    if(email==""){
        error.innerHTML='Please enter your email id'
        return false;
    }
    if(reg.test(email)==false){
      error.innerHTML='invalid email id'
      return false;
    }
    if(phoneerror.test(phone)==false){
        error.innerHTML='Phone number should contain 10 numbers'
        return false;
    }
    if(passworderror.test(password)==false){
        error.innerHTML='password must contain 8 characters, at least one special character, and at least one uppercase letter'
        return false;
    }
    if(password!==cpassword){
        error.innerHTML='Passwords do not match'
    }
    return true;
  
  }