// -----------navbar js--------
function toggleMenu() {
  const navbar = document.querySelector('.navbar');
  navbar.classList.toggle('open');
}
function indexPage(){
  window.location.href = "index.html";
}
function loginPage(){
  window.location.href = "/htmls/login_signup.html";
}
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
});
function signupPage(){
  window.location.href = "/htmls/login_signup.html";
}
// ----------aboutPage.js----
const backToTopButton = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.style.display = 'block';
      } else {
        backToTopButton.style.display = 'none';
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
      
