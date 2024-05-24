function runMA() {
    const input = document.getElementById('input').value;
    const output = document.getElementById('output');
    const lines = input.split('\n').map(line => line.trim());
    let error = '';
    
    function checkVarDeclaration(line, lineNumber) {
        if (!line.startsWith('VAR ')) {
            error = `Ошибка на строке ${lineNumber + 1}: Отсутствие ключевого слова VAR`;
            return false;
        }
        const declaration = line.slice(4).split(':');
        if (declaration.length !== 2) {
            error = `Ошибка на строке ${lineNumber + 1}: Неправильный синтаксис объявления переменных`;
            return false;
        }
        const variables = declaration[0].split(',');
        for (let variable of variables) {
            if (!/^[a-zA-Z]+$/.test(variable.trim()) || variable.trim().length > 8) {
                error = `Ошибка на строке ${lineNumber + 1}: Неправильное название переменной ${variable.trim()}`;
                return false;
            }
        }
        if (declaration[1].trim() !== 'INTEGER;') {
            error = `Ошибка на строке ${lineNumber + 1}: Отсутствие типа данных INTEGER`;
            return false;
        }
        return true;
    }

    function checkBegin(line, lineNumber) {
        if (line !== 'BEGIN') {
            error = `Ошибка на строке ${lineNumber + 1}: Отсутствие ключевого слова BEGIN`;
            return false;
        }
        return true;
    }

    function checkEnd(line, lineNumber) {
        if (line !== 'END') {
            error = `Ошибка на строке ${lineNumber + 1}: Отсутствие ключевого слова END`;
            return false;
        }
        return true;
    }

    function checkAssignment(line, lineNumber) {
        const parts = line.split('=');
        if (parts.length !== 2) {
            error = `Ошибка на строке ${lineNumber + 1}: Отсутствие оператора присваивания =`;
            return false;
        }
        const left = parts[0].trim();
        if (!/^[a-zA-Z]+$/.test(left) || left.length > 8) {
            error = `Ошибка на строке ${lineNumber + 1}: Неправильное название переменной ${left}`;
            return false;
        }
        const right = parts[1].trim();
        if (!right.endsWith(';')) {
            error = `Ошибка на строке ${lineNumber + 1}: Присваивание должно заканчиваться точкой с запятой`;
            return false;
        }
        return checkExpression(right.slice(0, -1).trim(), lineNumber);
    }

    function checkExpression(expression, lineNumber) {
        const unaryOperator = /^-$/;
        const binaryOperators = /^[\+\-\*]$/;
        const operands = /^[a-zA-Z]+$|^\d+$/;

        const tokens = expression.split(/\s+/);

        let expectingOperand = true;
        for (let token of tokens) {
            if (expectingOperand) {
                if (operands.test(token)) {
                    expectingOperand = false;
                } else if (!unaryOperator.test(token)) {
                    error = `Ошибка на строке ${lineNumber + 1}: Ожидался операнд или унарный оператор, найдено "${token}"`;
                    return false;
                }
            } else {
                if (!binaryOperators.test(token)) {
                    error = `Ошибка на строке ${lineNumber + 1}: Ожидался бинарный оператор, найдено "${token}"`;
                    return false;
                }
                expectingOperand = true;
            }
        }

        if (expectingOperand) {
            error = `Ошибка на строке ${lineNumber + 1}: Неправильное выражение, ожидался операнд`;
            return false;
        }

        return true;
    }

    let parsingState = 'START';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        switch (parsingState) {
            case 'START':
                if (!checkVarDeclaration(line, i)) {
                    output.textContent = error;
                    return;
                }
                parsingState = 'VARS_DECLARED';
                break;
            case 'VARS_DECLARED':
                if (!checkBegin(line, i)) {
                    output.textContent = error;
                    return;
                }
                parsingState = 'IN_BEGIN';
                break;
            case 'IN_BEGIN':
                if (line === 'END') {
                    if (!checkEnd(line, i)) {
                        output.textContent = error;
                        return;
                    }
                    parsingState = 'END';
                } else {
                    if (!checkAssignment(line, i)) {
                        output.textContent = error;
                        return;
                    }
                }
                break;
            case 'END':
                output.textContent = `Ошибка на строке ${i + 1}: Программа должна заканчиваться ключевым словом END`;
                return;
        }
    }

    if (parsingState !== 'END') {
        output.textContent = `Ошибка: Программа должна заканчиваться ключевым словом END`;
        return;
    }

    output.textContent = 'Программа корректна';
}
