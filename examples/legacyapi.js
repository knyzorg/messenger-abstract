/**
 * This is an example of using Messenger Events to directly interact with 
 */

// Require library
require("../messenger-events")

// Authenticate
({email: "slava@knyz.org", password: "Z2]>T9^w.c8gxA{rPR"},
(success, $) => {
    if (!success) return console.log($);
    // Using the legacy API is fairly simple (provided you know how to work with it normally)

    // facebook-chat-api code is commented out

  //var stopListening = api.listen((err, event) => {
    var stopListening = $.legacyListen((err, event) => {
        // Using $.api.listen() would break everything all other event handlers
        if(err) return console.error(err);

        switch(event.type) {
            case "message":
                if(event.body === '/stop') {
                    //api.sendMessage("Goodbye...", event.threadID);
                    $.api.sendMessage("Goodbye...", event.threadID);
                    return stopListening();
                }
                //api.markAsRead(event.threadID, (err) => {
                $.api.markAsRead(event.threadID, (err) => {
                        if(err) console.log(err);
                });
                //api.sendMessage("TEST BOT: " + event.body, event.threadID);
                //$.api.sendMessage("TEST BOT: " + event.body, event.threadID);
                console.log("Yay")
                break;
            case "event":
                console.log(event);
                break;
        }
    });
})