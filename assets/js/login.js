// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB66gvws1L8DskwnAoFeasVrSZc6Qg-IfY",
    authDomain: "trebealgame.firebaseapp.com",
    projectId: "trebealgame",
    storageBucket: "trebealgame.appspot.com",
    messagingSenderId: "908782066246",
    appId: "1:908782066246:web:ee3b4772e44c2572c10847"
  };
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  document.addEventListener('DOMContentLoaded', function() {
      // Elementos del DOM
      const loginToggle = document.getElementById('login-toggle');
      const registerToggle = document.getElementById('register-toggle');
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');
      const showLoginLink = document.getElementById('show-login');
      const forgotPasswordLink = document.getElementById('forgot-password');
      const registerBtn = document.getElementById('register-btn');
      
      // Elementos de validación de contraseña
      const passwordInput = document.getElementById('register-password');
      const passwordStrengthBar = document.getElementById('password-strength-bar');
      const passwordStrengthLabel = document.getElementById('password-strength-label');
      const passwordContainer = document.querySelector('.password-strength');
      const reqLength = document.getElementById('req-length');
      const reqUppercase = document.getElementById('req-uppercase');
      const reqNumber = document.getElementById('req-number');
      const reqSpecial = document.getElementById('req-special');
  
      // Toggle entre formularios
      loginToggle.addEventListener('click', function(e) {
          e.preventDefault();
          switchForm(this, registerToggle, loginForm, registerForm);
      });
      
      registerToggle.addEventListener('click', function(e) {
          e.preventDefault();
          switchForm(this, loginToggle, registerForm, loginForm);
      });
      
      showLoginLink.addEventListener('click', function(e) {
          e.preventDefault();
          loginToggle.click();
      });
      
      // Mostrar/ocultar contraseña
      const togglePasswordIcons = document.querySelectorAll('.toggle-password');
      togglePasswordIcons.forEach(icon => {
          icon.addEventListener('click', function() {
              togglePasswordVisibility(this);
          });
      });
      
      // Validación de contraseña en tiempo real
      passwordInput.addEventListener('input', function() {
          validatePasswordStrength(this.value);
      });
  
      // Recuperar contraseña
      forgotPasswordLink.addEventListener('click', function(e) {
          e.preventDefault();
          handlePasswordReset();
      });
      
      // Login con email y contraseña
      loginForm.addEventListener('submit', function(e) {
          e.preventDefault();
          handleLogin();
      });
      
      // Registro de nuevo usuario
      registerForm.addEventListener('submit', function(e) {
          e.preventDefault();
          handleRegistration();
      });
  
      // ----------------------
      // FUNCIONES DE PASSWORD
      // ----------------------
  
      function validatePasswordStrength(password) {
          // Resetear clases
          passwordContainer.className = 'password-strength strength-weak';
          
          // Verificar requisitos
          const hasMinLength = password.length >= 8;
          const hasUppercase = /[A-Z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
          
          // Actualizar íconos de requisitos
          updateRequirement(reqLength, hasMinLength);
          updateRequirement(reqUppercase, hasUppercase);
          updateRequirement(reqNumber, hasNumber);
          updateRequirement(reqSpecial, hasSpecial);
          
          // Calcular fuerza
          let strength = 0;
          let strengthClass = 'strength-weak';
          let strengthText = 'Muy débil';
          
          if (password.length > 0) strength += 25;
          if (hasMinLength) strength += 25;
          if (hasUppercase) strength += 20;
          if (hasNumber) strength += 15;
          if (hasSpecial) strength += 15;
          
          // Determinar nivel de fuerza
          if (strength >= 80) {
              strengthClass = 'strength-strong';
              strengthText = 'Muy fuerte';
          } else if (strength >= 60) {
              strengthClass = 'strength-good';
              strengthText = 'Fuerte';
          } else if (strength >= 30) {
              strengthClass = 'strength-medium';
              strengthText = 'Moderada';
          }
          
          // Aplicar cambios visuales
          passwordContainer.className = `password-strength ${strengthClass}`;
          passwordStrengthBar.style.width = `${strength}%`;
          passwordStrengthLabel.textContent = `Seguridad: ${strengthText}`;
          passwordStrengthLabel.style.color = getStrengthColor(strengthClass);
          
          // Habilitar/deshabilitar botón de registro
          registerBtn.disabled = strength < 60 || !hasMinLength;
      }
      
      function updateRequirement(element, isValid) {
          if (isValid) {
              element.classList.add('valid');
          } else {
              element.classList.remove('valid');
          }
      }
      
      function getStrengthColor(strengthClass) {
          const colors = {
              'strength-weak': '#ff4757',
              'strength-medium': '#ffa502',
              'strength-good': '#2ed573',
              'strength-strong': '#1dd1a1'
          };
          return colors[strengthClass] || '#ff4757';
      }
  
      // ----------------------
      // FUNCIONES PRINCIPALES
      // ----------------------
  
      function switchForm(activeTab, inactiveTab, activeForm, inactiveForm) {
          activeTab.classList.add('active');
          inactiveTab.classList.remove('active');
          activeForm.classList.add('active');
          inactiveForm.classList.remove('active');
          clearMessages();
      }
  
      function togglePasswordVisibility(icon) {
          const input = icon.previousElementSibling;
          const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
          input.setAttribute('type', type);
          icon.classList.toggle('fa-eye');
          icon.classList.toggle('fa-eye-slash');
      }
  
      function handlePasswordReset() {
          const email = document.getElementById('login-email').value;
          
          if (!email) {
              showError('login-error', 'Por favor ingresa tu correo electrónico');
              return;
          }
          
          auth.sendPasswordResetEmail(email)
              .then(() => {
                  showSuccess('login-error', 'Se ha enviado un correo para restablecer tu contraseña');
              })
              .catch(error => {
                  handleAuthError('login-error', error);
              });
      }
  
      async function handleLogin() {
          const btn = loginForm.querySelector('.btn');
          const email = document.getElementById('login-email').value;
          const password = document.getElementById('login-password').value;
          const rememberMe = document.getElementById('remember-me').checked;
          
          // Validación básica
          if (!email || !password) {
              showError('login-error', 'Por favor completa todos los campos');
              return;
          }
  
          try {
              // Configurar persistencia de sesión
              const persistence = rememberMe ? 
                  firebase.auth.Auth.Persistence.LOCAL : 
                  firebase.auth.Auth.Persistence.SESSION;
              
              await auth.setPersistence(persistence);
              
              btn.classList.add('loading');
              btn.disabled = true;
              
              const userCredential = await auth.signInWithEmailAndPassword(email, password);
              
              // Redireccionar después de login exitoso
              window.location.href = 'index.html';
          } catch (error) {
              btn.classList.remove('loading');
              btn.disabled = false;
              handleAuthError('login-error', error);
          }
      }
  
      async function handleRegistration() {
          const btn = registerBtn;
          const name = document.getElementById('register-name').value;
          const email = document.getElementById('register-email').value;
          const password = document.getElementById('register-password').value;
          const confirmPassword = document.getElementById('register-confirm').value;
          
          // Validaciones básicas
          if (!name || !email || !password || !confirmPassword) {
              showError('register-error', 'Por favor completa todos los campos');
              return;
          }
          
          if (password !== confirmPassword) {
              showError('register-error', 'Las contraseñas no coinciden');
              return;
          }
          
          if (!document.getElementById('accept-terms').checked) {
              showError('register-error', 'Debes aceptar los términos y condiciones');
              return;
          }
  
          try {
              btn.classList.add('loading');
              btn.disabled = true;
              
              // Crear usuario
              const userCredential = await auth.createUserWithEmailAndPassword(email, password);
              
              // Actualizar nombre del usuario
              await userCredential.user.updateProfile({
                  displayName: name
              });
              
              // Enviar verificación por email (opcional)
              await userCredential.user.sendEmailVerification();
              
              showSuccess('register-success', '¡Registro exitoso! Te hemos enviado un email de verificación.');
              
              // Redireccionar después de 3 segundos
              setTimeout(() => {
                  window.location.href = 'dashboard.html';
              }, 3000);
          } catch (error) {
              btn.classList.remove('loading');
              btn.disabled = false;
              handleAuthError('register-error', error);
          }
      }
  
      // ----------------------
      // FUNCIONES AUXILIARES
      // ----------------------
  
      function clearMessages() {
          document.querySelectorAll('.error-message, .success-message').forEach(el => {
              el.style.display = 'none';
              el.textContent = '';
          });
      }
      
      function showError(elementId, message) {
          const element = document.getElementById(elementId);
          element.textContent = message;
          element.style.display = 'block';
          
          // Ocultar el mensaje después de 5 segundos
          setTimeout(() => {
              element.style.display = 'none';
          }, 5000);
      }
      
      function showSuccess(elementId, message) {
          const element = document.getElementById(elementId);
          element.textContent = message;
          element.style.display = 'block';
      }
      
      function handleAuthError(elementId, error) {
          let errorMessage = 'Email o Passwoard Incorecto';
          
          const errorMessages = {
              'auth/invalid-email': 'El correo electrónico no es válido',
              'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
              'auth/user-not-found': 'No existe una cuenta con este correo',
              'auth/wrong-password': 'Contraseña incorrecta',
              'auth/email-already-in-use': 'Este correo ya está registrado',
              'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
              'auth/operation-not-allowed': 'Error de configuración. Contacta al administrador.',
              'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
              'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
          };
          
          if (errorMessages[error.code]) {
              errorMessage = errorMessages[error.code];
          }
          
          console.error('Error de autenticación:', error.code, error.message);
          showError(elementId, errorMessage);
      }
  
      
      });
