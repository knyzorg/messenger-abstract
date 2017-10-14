// This is a basic example of how to use the messenger events library

const fs = require("fs");

let auth = {
    email: "slava@knyz.org",
    password: fs.readFileSync("mypassword.txt").toString()
}


require("../messenger-events")
    (auth,
    (success, $) => {
        if (!success) {
            return console.log("Failed to login");
        }
        console.log("Successfully Logged In");

        // message encompasses all attachments (sticker, files, images, shares, videos, etc)
        // using those specific handlers would be pure syntaxic sugar
        // the message event also has the benefit of being "reactable" to as opposed to attachments
        $.onMessage((context, message) => {
            console.log("Message sent from", context.user.name, "in thread", context.thread.name , ": ")
            console.log("\t", message.body)
        })

        $.onSticker((context, sticker) => {
            console.log("Sticker sent from", context.user.name, "in thread", context.thread.name, ": ")
            console.log("\tURL:", sticker.url)
        })

        $.onStatusChange((context, status) => {
            console.log("Online status changed for", context.user.name,": ")
            console.log("\tIs now:", status.online ? "Online" : "Offline")
        })

        $.onNicknameChange((context, target) => {
            console.log(context.user.name, "has renamed in thread", context.thread.name)
            console.log("\t", target.user.name, "is now", target.nickname)
        })


        $.onUserAdd((context, target) => {
            console.log(context.user.name, "has added a participant to thread", context.thread.name)
            console.log("\t", target.user.name, "has been added")
            target.user.changeNickname("Newly Added User")
        })

        $.onUserRemove((context, target) => {
            context.thread.sendMessage("I shall not permit the removal of " + target.user.name)
            target.user.addUserToGroup();
        })
    })