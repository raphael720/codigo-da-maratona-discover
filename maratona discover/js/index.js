const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get() {
        // o JSON.parce() => que vai fazer a transformação
        return JSON.parse(localStorage.getItem('dev.finances:transactions')) || [];
    },

    set(transactions) {
        // o JSON aqui ele vai ta transformando o meu array em uma string
        localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions));
    }
};

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction);

        App.reload();
    },

    remove(index) {
        this.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        // Somar as entradas
        let income = 0;
        //pegar todas as transações
        // para cada transação,
        this.all.forEach( (transaction) => {
            // se for maior que zero
            if(transaction.amount > 0) {
                // somar a uma variavel e retornar a variavel
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        // Somar as saidas
        let expense = 0;
        //pegar todas as transações
        // para cada transação,
        this.all.forEach( (transaction) => {
            // se for menor que zero
            if(transaction.amount < 0) {
                // somar a uma variavel e retornar a variavel
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        // Entradas - Saidas  
        return this.incomes() + this.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = this.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        this.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount > 0 ? 'income' : 'expense';

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class=${cssClass}>${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `
        return html;
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        this.transactionsContainer.innerHTML = "";
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : "";
        // O replace(prop1, prop2) => ele vai trocar uma coisa por outra, ou seja, 
        //ele vai trocar de lugar a prop1 pela prop2;
        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString('pr-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        return signal + value;
    },

    formatAmount(value) {
        value = Number(value.replace(/\,\./g, '')) * 100;

        return value;
    },

    formatDate(date) {
        const splittedDate = date.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }
};

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value, 
        }
    },

    validateField() {
        // Aqui eu estou fazendo uma desistruturação para pegar cada elemento desse objeto;
        const { description, amount, date } = this.getValues();

        //Aqui ele vai verificar se cade um desses atributos estão vazios ou não
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
            //O throw => ele vai jogar para fora alguma coisa, um argumento por exemplo, nesse caso uma funcionalidade Error()
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues() {
        let { description, amount, date } = this.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return {description, amount, date};
    },

    clearFields() {
        this.description.value = '';
        this.amount.value = '';
        this.date.value = '';
    },

    submit(event) {
        event.preventDefault();// aqui ele ta fazendo com que o o formulario não seja enviado
        //O try ele vai tentar realizar uma linha de raciocinio e caso ele não consiga ele vai pro catch (), que vai realizar outra
        try {
            // verificar se todas as informações foram preenchidas
            this.validateField();
            // formatar os dadoss para salvar
            const transactionFormated = this.formatValues();
            // Salvar no array onde estão todas as transações
            Transaction.add(transactionFormated);
            // Apagar os dados do formulario
            this.clearFields();
            // fechar o modal
            Modal.close()
            // atualização da aplicação vai no add

        } catch (error) {
            alert(error.message);
        }
    }
};

const App = {
    init() {
        // Aqui ele ta dizendo que para cada elemento do transactions ele vai executar essa função
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        });
        
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },

    reload() {
        DOM.clearTransactions();
        App.init();
    }
};

App.init();

