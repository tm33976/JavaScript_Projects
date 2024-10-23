
        const display = document.querySelector('.result');
        const history = document.querySelector('.history');
        const mathBackground = document.getElementById('mathBackground');
        let currentInput = '0';
        let memory = 0;
        let lastOperation = '';
        let lastResult = '';

        function updateDisplay() {
            display.textContent = currentInput;
        }

        function addToHistory(operation, result) {
            history.textContent = `${operation} = ${result}`;
        }

        function changeBackgroundTheme(operation, result) {
            let backgroundColor, symbolColor;

            switch(operation) {
                case '+':
                    backgroundColor = '#e6ffe6';
                    symbolColor = '#00cc00';
                    break;
                case '-':
                    backgroundColor = '#ffe6e6';
                    symbolColor = '#cc0000';
                    break;
                case '×':
                    backgroundColor = '#e6e6ff';
                    symbolColor = '#0000cc';
                    break;
                case '÷':
                    backgroundColor = '#fff2e6';
                    symbolColor = '#cc6600';
                    break;
                default:
                    backgroundColor = '#e6f3ff';
                    symbolColor = '#0066cc';
            }
            if (result < 0) {
                backgroundColor = shadeColor(backgroundColor, -20);
            } else if (result > 100) {
                backgroundColor = shadeColor(backgroundColor, 20);
            }

            mathBackground.style.backgroundColor = backgroundColor;
            document.querySelectorAll('.math-symbol').forEach(symbol => {
                symbol.style.color = symbolColor;
            });
        }

        function shadeColor(color, percent) {
            let R = parseInt(color.substring(1,3),16);
            let G = parseInt(color.substring(3,5),16);
            let B = parseInt(color.substring(5,7),16);

            R = parseInt(R * (100 + percent) / 100);
            G = parseInt(G * (100 + percent) / 100);
            B = parseInt(B * (100 + percent) / 100);

            R = (R<255)?R:255;  
            G = (G<255)?G:255;  
            B = (B<255)?B:255;  

            let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
            let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
            let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

            return "#"+RR+GG+BB;
        }

        document.querySelector('.buttons').addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('button')) {
                const action = target.textContent;

                target.classList.add('clicked');
                setTimeout(() => target.classList.remove('clicked'), 200);

                if ('0123456789.'.includes(action)) {
                    if (currentInput === '0' || lastOperation === '=') {
                        currentInput = action;
                        lastOperation = '';
                    } else {
                        currentInput += action;
                    }
                } else if (action === 'C') {
                    currentInput = '0';
                    lastOperation = '';
                    lastResult = '';
                    history.textContent = '';
                    changeBackgroundTheme('', 0);
                } else if (action === '±') {
                    currentInput = (parseFloat(currentInput) * -1).toString();
                } else if (action === '%') {
                    currentInput = (parseFloat(currentInput) / 100).toString();
                } else if (action === 'EXP') {
                    currentInput += 'e';
                } else if ('+-×÷'.includes(action)) {
                    currentInput += action;
                    changeBackgroundTheme(action, parseFloat(currentInput));
                } else if (action === '=') {
                    try {
                        const result = eval(currentInput.replace('×', '*').replace('÷', '/'));
                        addToHistory(currentInput, result);
                        currentInput = result.toString();
                        lastOperation = '=';
                        changeBackgroundTheme(currentInput.match(/[+\-×÷]/)?.[0] || '', result);
                    } catch (error) {
                        currentInput = 'Error';
                    }
                }
                updateDisplay();
            }
        });

        document.addEventListener('keydown', (event) => {
            const key = event.key;
            if ('0123456789.+-*/'.includes(key)) {
                currentInput += key;
                if ('+-*/'.includes(key)) {
                    changeBackgroundTheme(key === '*' ? '×' : key === '/' ? '÷' : key, parseFloat(currentInput));
                }
            } else if (key === 'Enter') {
                try {
                    const result = eval(currentInput.replace('×', '*').replace('÷', '/'));
                    addToHistory(currentInput, result);
                    currentInput = result.toString();
                    lastOperation = '=';
                    changeBackgroundTheme(currentInput.match(/[+\-×÷]/)?.[0] || '', result);
                } catch (error) {
                    currentInput = 'Error';
                }
            } else if (key === 'Escape') {
                currentInput = '0';
                lastOperation = '';
                lastResult = '';
                history.textContent = '';
                changeBackgroundTheme('', 0);
            }
            updateDisplay();
        });

        updateDisplay();

      
        const mathSymbols = ['+', '-', '×', '÷', '=', '∑', '∫', '∂', 'π', '√', '∞', 'Δ', 'θ', 'λ', 'μ', 'σ', 'φ', 'Ω'];
        const numSymbols = 100;

        for (let i = 0; i < numSymbols; i++) {
            const symbol = document.createElement('div');
            symbol.classList.add('math-symbol');
            symbol.textContent = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
            symbol.style.left = `${Math.random() * 100}%`;
            symbol.style.top = `${Math.random() * 100}%`;
            symbol.style.transform = `rotate(${Math.random() * 360}deg)`;
            mathBackground.appendChild(symbol);
        }
        changeBackgroundTheme('', 0);
 