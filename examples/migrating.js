/**
 * This is a modified example of legacyapi.js
 * to show how easy it is to migrate to
 * Messenger Events gradually.
 */

// Require library
require("../messenger-events")

// Authenticate
({email: "FB_EMAIL", password: "FB_PASS"},
(success, $) => {
    if (!success) return console.log($);
    
    // Adding these this will make all your old programs "just work"
    let api = $.api;

    var stopListening = api.listen((err, event) => {
        if(err) return console.error(err);
        switch(event.type) {
            case "message":
                if(event.body === '/stop') {
                    api.sendMessage("Goodbye...", event.threadID);
                    return stopListening();
                }
                api.markAsRead(event.threadID, (err) => {
                        if(err) console.log(err);
                });
                api.sendMessage("TEST BOT: " + event.body, event.threadID);
                break;
            case "event":
                console.log(event);
                break;
        }
    });
})