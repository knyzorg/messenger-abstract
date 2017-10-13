// This is a basic example of how to use the messenger events library

const fs = require("fs");

let auth = {
    email: "slava@knyz.org",
    password: fs.readFileSync("mypassword.txt").toString()
}


require("./messenger-events")
    (auth, { listenEvents: true, selfListen: true,  updatePresence: true },
    (success, $) => {
        if (!success) {
            return console.log("Failed to login");
        }
        console.log("Successfully Logged In");

        // message encompasses all attachments (sticker, files, images, shares, videos, etc)
        // using those specific handlers would be pure syntaxic sugar
        // the message event also has the benefit of being "reactable" to as opposed to attachments
        $.handlers.message = (context, message) => {
            console.log("Message sent from", context.user.name, "in thread", context.thread.name , ": ")
            console.log("\t", message.body)
            if (message.body == "Yo") {
                //context.thread.sendMessage("Yo");
                message.react
            }
        }

        $.handlers.sticker = (context, sticker) => {
            console.log("Sticker sent from", context.user.name, "in thread", context.thread.name, ": ")
            console.log("\tURL:", sticker.url)
        }

        $.handlers.status = (context, status) => {
            console.log("Online status changed for", context.user.name,": ")
            console.log("\tIs now:", status.online ? "Online" : "Offline")
        }
    })