/**
 * This is an example of using Messenger Events
 * to directly interact with facebook-chat-api
 * instead of passing through abstractions.
 * This can be a good idea if you want something
 * very specific or need a feature which isn't
 * present in the abstractions.
 * 
 * You can still take advantage of the abstractions
 * as needed by invoking $.getThread(threadID) and
 * $.getUser(userID) but it's pointless to do so.
 */

// Require library
require("messenger-events")

// Authenticate
({email: "FB_EMAIL", password: "FB_PASS"},
(success, $) => {
    if (!success) return console.log($);
    // facebook-chat-api code is commented out
    console.log($)
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
                $.api.sendMessage("TEST BOT: " + event.body, event.threadID);
                break;
            case "event":
                console.log(event);
                break;
        }
    });
})