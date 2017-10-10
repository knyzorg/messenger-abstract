const fs = require("fs");

let auth = {
    email: "slava@knyz.org",
    password: fs.readFileSync("mypassword.txt").toString()
}


require("./messenger-events")
    (auth, { listenEvents: true, selfListen: true, logLevel: "warn" },
    (success, $) => {
        if (!success) {
            return console.log("Failed to login");
        }
        console.log("Successfully Logged In");
        
        $.handlers.message = (user, message) => {
            console.log("Message sent from", user.name, "in thread", user.thread, ": ")
            console.log("\t",message.body)
        }

        $.handlers.sticker = (user, sticker) => {
            console.log("Sticker sent from", user.name, "in thread", user.thread, ": ")
            console.log("\tURL:",sticker.url)
        }
    })