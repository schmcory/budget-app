/*--------- UI MODULE --------*/
//Get input values
//Add new item to the UI 
//Update UI 
//IIFE - Immediately Invoked Function Expression
//Seperation of concerns, each part of the application should be concerned with doing only one thing independently 
//To return multiple values at once - return an object

//BUDGET CONTROLLER
var budgetController = (function () { 
    
    var expense = function(id, description, value) {
        this.id = id; 
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    expense.prototype.calcPercentage = function(totalIncome) {
        
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100); 
        } else {
            this.percentage = -1; 
        }
        
    };
    
    expense.prototype.getPercentage = function() {
        return this.percentage; 
    };
    
    var income = function(id, description, value) {
        this.id = id; 
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        
        var sum = 0;
        
        data.allItems[type].forEach(function(curr) {
            sum += curr.value; 
        });
        
        data.totals[type] = sum; 
        
    }; 
    
    //Data structure holds the expenses and incomes
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    
    return {
        addItem: function(type, des, val) {
            var newItem, id;
            
            //Create new id
            if(data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;               
            } else {
                id = 0; 
            }
  
            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new expense(id, des, val);
            } else if (type === 'inc') {
                newItem = new income(id, des, val);
            }
            
            //push it into our data structure
            data.allItems[type].push(newItem);
            
            //return the new element
            return newItem; 
        },
        
    deleteItem: function(type, id) {
        var ids, index;  
       
        ids = data.allItems[type].map(function (current) {
                return current.id;  
        });
        
        index = ids.indexOf(id); 
        
        if(index !== - 1) {
            data.allItems[type].splice(index, 1);  
        }
        
    },
        
    calculateBudget: function() {
        
        // calculate total income and expenses
        calculateTotal('exp');
        calculateTotal('inc');
        
        // calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp; 
        
        if(data.totals.inc > 0) {
            // calculate the percentage of income that we spent
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);                   
        }else {
            data.percentage = -1
        }

    },
        
    calculatePercentages: function() {
        
        data.allItems.exp.forEach(function (curr) {
            
            curr.calcPercentage(data.totals.inc); 
      
        });  
    },
        
    getPercentages: function() {
        
        var allPerc = data.allItems.exp.map(function (curr) {
            return curr.getPercentage();
        }); 
        return allPerc;                                 
    },
        
    getBudget: function() {
        return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        }
    },
        
    
    testing: function() {
        console.log(data); 
    }
    };
    
     
})();

var UIController = (function () {
      
    //Object holds the class selector strings (index.html)
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        containerClass: '.container',
        percentages: '.item__percentage',
        dataLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec; 
            
            num = Math.abs(num); 
            num = num.toFixed(2);
            
            numSplit = num.split('.'); 
            
            int = numSplit[0];
            
            if(int.length > 3) {
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3); 
            }
            
            dec = numSplit[1]; 
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec; 
    };
    
    var nodeListForEach = function(list, callback) {
                
            for(var i = 0; i < list.length; i++) {
                callback(list[i], i);
            }        
    }; 
    
    //returns a function object
    return {
        //function object gets input from the user
        getInput: function() {
            //object to return multiple values at once
            return {
                //will be either inc or exp 
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(object, type) {
            var html, newHtml, element; 
           
            // Create an HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; 
                
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }        
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', object.id); 
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', formatNumber(object.value, type));       
            
            // Insert the HTML into the DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);          
        },
        
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID); 
            element.parentNode.removeChild(element); 
        },
        
        clearFields: function() {
           var fields, fieldsArray;
            
           fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); 
            
           fieldsArray = Array.prototype.slice.call(fields);
            
           fieldsArray.forEach(function (current, index, array) {
                current.value = "";
           });
            
           fieldsArray[0].focus();
           
        },
        
        displayBudget: function(obj) {
            var type; 
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type); 
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc'); 
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp'); 
            
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentage) {
            var fields; 
            
            fields = document.querySelectorAll(DOMstrings.percentages);
            
            
            nodeListForEach(fields, function(current, index) {
                
                //Do stuff
                
                if(percentage > 0) { 
                    current.textContent = percentage[index] + '%';
                }else {
                    current.textContent = '---';
                }    
                
            });
            
        },
        
        
        displayMonth: function() {
            var now, year
            
            now = new Date();
            year = now.getFullYear(); 
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
            month = now.getMonth();
            
            document.querySelector(DOMstrings.dataLabel).textContent = months[month] + ' ' + year; 
            
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll( 
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
                    cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red'); 
        },
        
        //function object returns DOMstrings, makes them public
        getDOMstrings: function() {
            return DOMstrings; 
        }
    };   
    
})();

//GLOBAL APP CONTROLLER
var appController = (function (bc, uic) {  
    
    var setupEventListeners = function() {
            var DOM = uic.getDOMstrings(); 
        
        
            document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem); 
  
            document.addEventListener('keypress', function(event) {
        
                if(event.keyCode === 13 || event.which === 13) {
                    ctrlAddItem(); 
                } 
            });
        
            document.querySelector(DOM.containerClass).addEventListener('click', ctrlDeleteItem);
        
            document.querySelector(DOM.inputType).addEventListener('change', uic.changedType);
    };
    
    var updateBudget = function() {
        var budget; 
        
        //1. Calculate the budget
        bc.calculateBudget(); 
        
        
        //2. Return the budget
        budget = bc.getBudget();
        
        //3. Display the budget on the UI
        uic.displayBudget(budget); 
        
        
    };
    
    var updatePercentages = function() {
        //1. Calculate percentages
        bc.calculatePercentages();
        
        //2. Read percentages from the budget controller
        var percentages;
        percentages = bc.getPercentages(); 
        
        //3. Update the UI with the new percentages
        uic.displayPercentages(percentages); 
        
    };
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        
        //1. Get the field input data
        input = uic.getInput(); 
        
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add the item to the budget controller
            newItem = bc.addItem(input.type, input.description, input.value); 
        
            //3. Add the new item to the UI 
            uic.addListItem(newItem, input.type); 
        
            //4. Clear the fields
            uic.clearFields(); 
        
            //5. Calculate and update budget
            updateBudget();
            
            //6. Calculate and update the percentages
            updatePercentages(); 
        } 
    };
    
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, id; 
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 
        
        if(itemID) {
            //inc-1
            splitID = itemID.split('-'); 
            type = splitID[0]; 
            id = parseInt(splitID[1]); 
            
            //1. Delete the item from the data structure
            bc.deleteItem(type, id); 
            
            
            //2. Delete the item from the UI
            uic.deleteListItem(itemID); 
            
            
            //3. Update and show the new budget
            updateBudget();
            
            //4. Calculate and update the percentages
            updatePercentages(); 
            
        }
    };
    
    return {
        init: function() {
            
            uic.displayMonth(); 
    
            uic.displayBudget( {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            }); 
            
            setupEventListeners();
        }
    };
    
})(budgetController, UIController); 


appController.init();


/* ========= DATA MODULE ---------- */
//Add new item to our data structure
//Calculate the budget


/*---------- CONTROLLER MODULE ----------*/
//Add Event Handler for check mark