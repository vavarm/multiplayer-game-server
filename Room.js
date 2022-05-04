module.exports = class Room {
    name;
    pwd;
    clients = [];

    constructor(name, pwd) {
        this.name = name;
        this.pwd = pwd;
    }

    addClient(id) {
        this.clients.push(id);
    }

    info() {
        var str = "--" + this.name + "/" + this.pwd + "--";
        return str;
    }

    getClients() {
        return this.clients;
    }
};