// login.js - Script para controle de login com redirecionamento especial

document.addEventListener('DOMContentLoaded', function() {
    // Configuração do Firebase (deve ser igual em todos os arquivos)
    const firebaseConfig = {
        apiKey: "AIzaSyDEkkRm5s1QieOXz7rdxJEE_nTuOQAfm1Y",
        authDomain: "gzltreinamentos.firebaseapp.com",
        databaseURL: "https://gzltreinamentos-default-rtdb.firebaseio.com",
        projectId: "gzltreinamentos",
        storageBucket: "gzltreinamentos.appspot.com",
        messagingSenderId: "991106826698",
        appId: "1:991106826698:web:be17262818bdc0e04c4f33",
        measurementId: "G-CG2PSQQ35G"
    };

    // Inicializa o Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    const auth = firebase.auth();
    const provider = new firebase.auth.GoogleAuthProvider();

    // Elementos do DOM
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const loginMessage = document.getElementById('loginMessage');

    // Configura o provedor do Google
    provider.setCustomParameters({
        prompt: 'select_account'
    });

    // Listener para botão de login com Google
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            auth.signInWithPopup(provider)
                .then(handleLoginSuccess)
                .catch(handleLoginError);
        });
    }

    // Observador de estado de autenticação
    auth.onAuthStateChanged(function(user) {
        if (user) {
            // Verifica se é o email de admin especial
            if (user.email === "mortadela22112005@gmail.com") {
                window.location.href = "src/admin.html";
            } else {
                // Redireciona usuários normais para outra página
                window.location.href = "src/home.html";
            }
        }
    });

    // Função para tratar login bem-sucedido
    function handleLoginSuccess(result) {
        console.log('Login bem-sucedido:', result.user);
        // O redirecionamento será tratado pelo authStateChanged
    }

    // Função para tratar erros de login
    function handleLoginError(error) {
        console.error('Erro no login:', error);
        if (loginMessage) {
            loginMessage.textContent = "Erro ao fazer login: " + error.message;
            loginMessage.style.color = "red";
        }
    }
});