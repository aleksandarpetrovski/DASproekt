 async function login() {
            const email = document.getElementById('email-login').value;
            const password = document.getElementById('password-login').value;

            if (email != "" && password != "") {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                const data = await response.text();
                console.log(data);
                document.querySelector('.login-message').textContent = data;
                localStorage.setItem('user', email);
                if (data == "Успешно логирање") {
                    window.location.href = "/svojprofil.html";
                }
            }
        }
