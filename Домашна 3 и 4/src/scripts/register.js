async function register() {
            const email = document.getElementById('email-register').value;
            const password = document.getElementById('password-register').value;

            if (email != "" && password != "") {
                const response = await fetch('/register', {
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
                document.querySelector('.register-message').textContent = data;
            }
        }
