$(document).ready(function() {
    //keep track of how many digits are in display not to exceed 7
    var display = [];
    //log all keystrokes for evaluation
    var memory = ['0'];
    //keep track of previous button click to prevent user error
    var clicked = 'ac';
    //save display for quick access
    var screen = $(".display");

    $("div.ac").on("click", function() {
        //empty display on all clear
        screen.text("0");
        clearDisplay();
        clicked = 'ac';
    });

    $("div.ce").on("click", function() {
        //do nothing if no operation in progress/input
        if (clicked == 'ce' || clicked == 'opce' || clicked == 'equals' || clicked == 'ac') {
        }
        // clear previous operator
        else if (clicked == 'operator') {
            memory.pop();
            screen.text("");
            clicked = 'opce';
        }
        //renove digits from screen and memory
        else {
            var digits = screen.text().length;
            memory.splice((memory.length - digits), digits);
            screen.text("");
            clicked = 'ce';
        }
        //reset display to 0 so prevent premature overflow (no pun intended)
        display.length = 0;
    });

    $("div.number").on("click", function() {
        //make sure digits dont overflow on screen, if they do, throw an error
        if (display.length >= 7 || clicked == 'opce') {
            clearDisplay();
            showError();
            clicked = 'ac';
            return;
        }
        //store the value of keystroke
        var temp = $(this).text();
        //if operator is currently on the calculator, remove it before adding new number to screen
        if (clicked == 'operator' || clicked == 'equals') {
            screen.text("");
            display = [];
            //start new operation if equals was hit previously
            if (clicked == 'equals') {
                memory = [];
            }
        }
        //if first digit being entered
        if (display == 0) {
            screen.text(temp);
            display.push(temp);
            memory.push(temp);
        }

        else {
           screen.append(temp);
           display.push(temp);
           memory.push(temp);
        }

        clicked = 'number';
    });

    $("div.operator").on("click", function() {
        //prevent operator from being hit twice in a row
        if (clicked == 'operator') {
            clearDisplay();
            showError();
            clicked = 'ac';
        }

        else {
            var temp = $(this).text();
            screen.text(temp);
            clicked = 'operator';
            memory.push(temp);
            display = [temp];
        }
    });

    $("div.decimal").on("click", function() {
        //prevent decimal from bing hit twice in a row
        if (clicked == 'decimal') {
            clearDisplay();
            showError();
            clicked ='ac';
        }

        else {
            var temp = $(this).text();
            //if last keystoke was an operator start new display
            if (clicked == 'operator') {
                screen.text(temp);
                display = [temp];
            }
            //if last keystroke was a number add decimal to end of current num
            else {
                screen.append(temp);
                display.push(temp);
            }
            memory.push(temp);
            clicked = 'decimal';
        }

    });

    $("div.equal").on("click", function() {
        //do nothing if operation is not completed
        if (clicked !== 'number' && clicked !== 'decimal') {
            return;
        }
        //combine memory into one string
        memory = memory.join('');
        var operator = '';
        var prevNum = '';
        var currNum = '';
        var solution;
        //loop through chained operations and begin evaluation
        for (var i = 0; i < memory.length; i++) {
            //addition
            if (memory.charCodeAt(i) == 43) {
                //check if this is the first operator, if so continue to second number in operation
                if (prevNum == '') {
                    operator = 'add';
                    prevNum = currNum;
                    currNum = '';
                }
                //evaluate using addition
                else {
                    solution = solve(operator, prevNum, currNum);
                    prevNum = solution;
                    currNum = '';
                    operator = 'add'
                }
            }
            //check to see if subtraction of negative number
            else if (memory.charCodeAt(i) == 45) {
                if (prevNum == '' && currNum == '') {
                    currNum += memory[i];
                }

                else {
                    if (operator == '') {
                        operator = 'subtract';
                        prevNum = currNum;
                        currNum = '';
                    }

                    else {
                        solution = solve(operator, prevNum, currNum);
                        prevNum = solution;
                        currNum = '';
                        operator = 'subtract';
                    }
                }
            }
            //multiplication
            else if (memory.charCodeAt(i) == 215) {
                if (prevNum == '') {
                    operator = 'multiply';
                    prevNum = currNum;
                    currNum = '';
                }

                else {
                    solution = solve(operator, prevNum, currNum);
                    prevNum = solution;
                    currNum = '';
                    operator = 'multiply'
                }
            }
            //division
            else if (memory.charCodeAt(i) == 247) {
                if (prevNum == '') {
                    operator = 'divide';
                    prevNum = currNum;
                    currNum = '';
                }

                else {
                    solution = solve(operator, prevNum, currNum);
                    prevNum = solution;
                    currNum = '';
                    operator = 'divide'
                }
            }
            //if no operation continue adding to current number
            else {
                currNum += memory[i];
            }
        }

        final = parseFloat(solve(operator, prevNum, currNum));
        //attach decimals without over flowing screen, or throw error if number too large
        if (final % 1 !== 0) {
            if (final > 9999999 || final < -99999) {
                clearDisplay();
                showError().delay(500);
                screen.text("0");
                final = [0];
                clicked = 'ac';
            }

            else if ( (final >= 100000 && final <= 9999999) || (final >= -99999 && final <= -10000) ) {
                final = final.toFixed(0);
                screen.text(final);
            }

            else if ((final >= 10000 && final <= 99999) || (final >= -9999 && final <= -1000)) {
                final = final.toFixed(1);
                screen.text(final);
            }

            else if ((final >= 1000 && final <= 9999) || (final >= -999 && final <= -100)) {
                final = final.toFixed(2);
                screen.text(final);
            }

            else if ((final >= 100 && final <= 999) || (final >= -99 && final <= -10)) {
                final = final.toFixed(3);
                screen.text(final);
            }

            else if ((final >= 10 && final <= 99) || (final >= -9 && final <= -1)) {
                final = final.toFixed(4);
                screen.text(final);
            }

            else {
                final = final.toFixed(5);
                screen.text(final);
            }

        }

        else {
            if (final.toString().length > 7) {
                clearDisplay();
                showError().delay(500);
                screen.text("0");
                clicked = 'ac';
            }
            else {
                screen.text(final);
            }
        }

    clicked = 'equals';
    memory = [final];
    display = [final];
    });

    function clearDisplay() {
        memory = [0];
        display = [];
    };

    function showError() {
        screen.text("Error");
    };
    //evaluate function
    function solve(operator, prevNum, currNum) {
        if (operator =='subtract') {
            var number = eval(prevNum - currNum).toString();
            return number;
        }

        else if (operator == 'add') {
            var x = parseFloat(prevNum);
            var y = parseFloat(currNum);
            var number = x + y;
            return number;
        }

        else if (operator == 'multiply') {
            var number = eval(currNum * prevNum).toString();
            return number;
        }

        else {
            var number = eval(prevNum / currNum).toString();
            return number;
        }
    }
});