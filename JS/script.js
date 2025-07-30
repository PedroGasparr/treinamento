document.addEventListener('DOMContentLoaded', function() {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');
    const googleSignIn = document.getElementById('googleSignIn');
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const forgotPassword = document.getElementById('forgotPassword');

    // Modal para dados adicionais (apenas para Google)
    const modal = document.createElement('div');
    modal.id = 'additionalDataModal';
    modal.style.display = 'none';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; width: 300px;">
            <h2>Informações Adicionais</h2>
            <p>Por favor, complete seu cadastro:</p>
            <form id="additionalDataForm">
                <input type="date" id="modalBirthdate" placeholder="Data de Nascimento" required style="width: 100%; margin: 10px 0; padding: 8px;">
                <select id="modalUnit" required style="width: 100%; margin: 10px 0; padding: 8px;">
                    <option value="" disabled selected>Selecione sua unidade</option>
                    <option value="ADM-MTZ-MCZ">ADM-MTZ-MCZ</option>
                                <option value="CD-SZL-SZN">CD-SZL-SZN</option>
                                <option value="CD-SZN-CAS">CD-SZN-CAS</option>
                                <option value="CD-SZN-CCA">CD-SZN-CCA</option>
                                <option value="CD-SZN-MCW">CD-SZN-MCW</option>
                                <option value="CD-SZN-SEA">CD-SZN-SEA</option>
                                <option value="CD-SZN-SJP">CD-SZN-SJP</option>
                                <option value="CD-SZN-SZN">CD-SZN-SZN</option>
                                <option value="CD-TRI-GRU">CD-TRI-GRU</option>
                                <option value="CD-TZK-SZN">CD-TZK-SZN</option>
                                <option value="CD-YHM-SP">CD-YHM-SP</option>
                                <option value="CLIENTE MUNKSJO">CLIENTE MUNKSJO</option>
                                <option value="F-AST-JCI">F-AST-JCI</option>
                                <option value="F-BTK-SRQ">F-BTK-SRQ</option>
                                <option value="F-IBM-EMB">F-IBM-EMB</option>
                                <option value="F-IMS-CIM">F-IMS-CIM</option>
                                <option value="F-IMS-LRA">F-IMS-LRA</option>
                                <option value="F-IMS-MCZ">F-IMS-MCZ</option>
                                <option value="F-JD-CAS">F-JD-CAS</option>
                                <option value="F-JD-CTL">F-JD-CTL</option>
                                <option value="F-JD-HZA">F-JD-HZA</option>
                                <option value="F-JD-MGO">F-JD-MGO</option>
                                <option value="F-JDBZ-IDU">F-JDBZ-IDU</option>
                                <option value="F-JDHB-IDU">F-JDHB-IDU</option>
                                <option value="F-NTR-MCZ">F-NTR-MCZ</option>
                                <option value="F-OJI-PAA">F-OJI-PAA</option>
                                <option value="F-OJI-RCA">F-OJI-RCA</option>
                                <option value="F-PCO-FSA">F-PCO-FSA</option>
                                <option value="F-PCO-MCZ">F-PCO-MCZ</option>
                                <option value="F-SRV-SZN">F-SRV-SZN</option>
                                <option value="F-SZN-ACZ">F-SZN-ACZ</option>
                                <option value="F-SZN-BLM">F-SZN-BLM</option>
                                <option value="F-SZN-CPO">F-SZN-CPO</option>
                                <option value="F-SZN-IMP">F-SZN-IMP</option>
                                <option value="F-SZN-JCI">F-SZN-JCI</option>
                                <option value="F-SZN-LRA">F-SZN-LRA</option>
                                <option value="F-SZN-MCW">F-SZN-MCW</option>
                                <option value="F-SZN-SZN">F-SZN-SZN</option>
                                <option value="F-WBR-CAR">F-WBR-CAR</option>
                                <option value="F-WBR-JAD">F-WBR-JAD</option>
                                <option value="F-WBR-MCZ">F-WBR-MCZ</option>
                                <option value="F-WTM-JCI">F-WTM-JCI</option>
                                <option value="ITM-SP">ITM-SP</option>
                                <option value="JSL - ARAUCARIA">JSL - ARAUCARIA</option>
                                <option value="JSL - CAPUAVA">JSL - CAPUAVA</option>
                                <option value="JSL - VOLTA REDONDA">JSL - VOLTA REDONDA</option>
                                <option value="LIMEIRA - CLIENTE">LIMEIRA - CLIENTE</option>
                </select>
                <button type="submit" style="width: 100%; padding: 10px; background: #FF4B2B; color: white; border: none; border-radius: 5px;">Continuar</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Alternar entre login e cadastro
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });

    // Login com Google
    googleSignIn.addEventListener('click', () => {
        const { auth, signInWithPopup, provider, database, ref, set } = window.firebase;
        
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                const isNewUser = result._tokenResponse.isNewUser;
                
                if (isNewUser) {
                    // Mostra o modal para coletar dados adicionais
                    modal.style.display = 'flex';
                    
                    // Configura o submit do formulário do modal
                    document.getElementById('additionalDataForm').onsubmit = (e) => {
                        e.preventDefault();
                        
                        const birthdate = document.getElementById('modalBirthdate').value;
                        const unit = document.getElementById('modalUnit').value;
                        
                        if (!birthdate || !unit) {
                            alert('Por favor, preencha todos os campos');
                            return;
                        }
                        
                        const userRef = ref(database, 'users/' + user.uid);
                        set(userRef, {
                            nome: user.displayName || 'Usuário Google',
                            email: user.email,
                            dataNascimento: birthdate,
                            unidade: unit,
                            provider: 'google'
                        }).then(() => {
                            modal.style.display = 'none';
                            alert('Cadastro completo com sucesso!');
                            window.location.href = 'src/home.html';
                        }).catch((error) => {
                            console.error("Erro ao salvar dados:", error);
                            alert("Erro ao salvar informações adicionais");
                        });
                    };
                } else {
                    // Usuário existente, apenas redireciona
                    window.location.href = 'src/home.html';
                }
            }).catch((error) => {
                console.error("Erro no login com Google:", error);
                alert("Erro ao fazer login com Google: " + error.message);
            });
    });

    // Login com email/senha
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const { auth, signInWithEmailAndPassword } = window.firebase;
        
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                window.location.href = 'src/home.html';
            })
            .catch((error) => {
                console.error("Erro no login:", error);
                alert("Erro ao fazer login: " + error.message);
            });
    });

    // Cadastro com email/senha
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signUpName').value;
        const email = document.getElementById('signUpEmail').value;
        const password = document.getElementById('signUpPassword').value;
        const birthdate = document.getElementById('signUpBirthdate').value;
        const unit = document.getElementById('signUpUnit').value;
        
        const { auth, createUserWithEmailAndPassword, database, ref, set } = window.firebase;
        
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                const userRef = ref(database, 'users/' + user.uid);
                set(userRef, {
                    nome: name,
                    email: email,
                    dataNascimento: birthdate,
                    unidade: unit,
                    provider: 'email'
                }).then(() => {
                    alert('Cadastro realizado com sucesso!');
                    window.location.href = 'src/home.html';
                }).catch((error) => {
                    console.error("Erro ao salvar dados:", error);
                    alert("Erro ao salvar informações: " + error.message);
                });
            })
            .catch((error) => {
                console.error("Erro no cadastro:", error);
                alert("Erro ao criar conta: " + error.message);
            });
    });

    // Recuperação de senha
    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt("Digite seu email para redefinir a senha:");
        
        if (email) {
            const { auth, sendPasswordResetEmail } = window.firebase;
            
            sendPasswordResetEmail(auth, email)
                .then(() => {
                    alert("Email de redefinição de senha enviado! Verifique sua caixa de entrada.");
                })
                .catch((error) => {
                    console.error("Erro ao enviar email:", error);
                    alert("Erro ao enviar email: " + error.message);
                });
        }
    });
});