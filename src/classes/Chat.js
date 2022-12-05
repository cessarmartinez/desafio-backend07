class Chat{
    static messagesList=[];

    addMessage(message){
        Chat.messagesList.push(message)
    }
}

module.exports = {Chat}