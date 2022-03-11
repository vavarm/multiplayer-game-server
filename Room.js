module.exports = class Room {
    name
    pwd
    playersList = ["Banana"]
    constructor(name, pwd) {
        this.name = name
        this.pwd = pwd
    }

    addPlayer(id) {
        this.playersList.push(id)
    }

    info() {
        var str = '--' + this.name + '/' + this.pwd + '--'
        return str
    }

    getPlayersList() {
        return this.playersList
    }

}