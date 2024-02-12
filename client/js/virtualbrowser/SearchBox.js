export class SearchBox {
    constructor() {
        this.matches = { active: 0, amount: 0 };
        this.textToSearch = '';
    }

    updateMatch(active, amount) {
        this.matches.active = active;
        this.matches.amount = amount;
    }

    reset() {
        this.matches = { active: 0, amount: 0 };
    }
}

export default {};
