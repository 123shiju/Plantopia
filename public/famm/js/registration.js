var signup_eye = document.querySelector(".signup_eye");
var signup_pass = document.querySelector(".signup_pass");
var set_signup_eye = document.querySelector(".signup_eye");

signup_eye.onclick = function () {
  if (signup_pass.type == "password") {
    signup_pass.type = "text";
    set_signup_eye.classList.remove('fa-eye-slash');
    set_signup_eye.classList.add('fa-eye');
  } else {
    signup_pass.type = "password";
    set_signup_eye.classList.add('fa-eye-slash');
    set_signup_eye.classList.remove('fa-eye');
  }
}

var login_eye = document.querySelector(".login_eye");
var login_pass = document.querySelector(".login_pass");
var set_login_eye = document.querySelector(".login_eye");

login_eye.onclick = function () {
  if (login_pass.type == "password") {
    login_pass.type = "text";
    set_login_eye.classList.remove('fa-eye-slash');
    set_login_eye.classList.add('fa-eye');
  } else {
    login_pass.type = "password";
    set_login_eye.classList.add('fa-eye-slash');
    set_login_eye.classList.remove('fa-eye');
  }
}
var signup_eye = document.querySelector(".signup_eye");
var signup_pass = document.querySelector(".signup_pass");

signup_eye.addEventListener('click', function () {
  if (signup_pass.type === "password") {
    signup_pass.type = "text";
    signup_eye.classList.remove('fa-eye-slash');
    signup_eye.classList.add('fa-eye');
  } else {
    signup_pass.type = "password";
    signup_eye.classList.add('fa-eye-slash');
    signup_eye.classList.remove('fa-eye');
  }
});

var login_eye = document.querySelector(".login_eye");
var login_pass = document.querySelector(".login_pass");

login_eye.addEventListener('click', function () {
  if (login_pass.type === "password") {
    login_pass.type = "text";
    login_eye.classList.remove('fa-eye-slash');
    login_eye.classList.add('fa-eye');
  } else {
    login_pass.type = "password";
    login_eye.classList.add('fa-eye-slash');
    login_eye.classList.remove('fa-eye');
  }
});
