// Require library
require("messenger-events")
// Authenticate
({email: "FB_EMAIL", password: "FB_PASSWORD"},
(success, $) => {
    // success is a boolean defining if the connection was successful
    // if the connection failed, $ contains the error object
    // otherwise $ will contain the event handlers, methods and the `api` object 
    if (!success) return console.log($);

    // handlers are defined as follows
    $.handlers.message = (context, message) => {
        // context contains the user, and if appropriate, the thread
        // context.user:
        /**
         * {
         *  // Information
         *  // The context user carries all of the information provided by https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#getUserInfo
         *  id: "00000000", // User ID,
         *  status: true, // True for online, false for offline, undefined if unknown
         *  nickname: "Joe" // Only set if in thread context
         * 
         *  // Methods
         *  // Note: threadID is an optional argument if the thread object exists in the context
         *  // Note 2: All of the methods can take a callback as their last argument
         *  sendMessage(msg), // The message object is explained here: https://github.com/Schmavery/facebook-chat-api/blob/master/DOCS.md#sendMessage
         *  addUserToGroup(threadID),
         *  removeUserToGroup(threadID),
         *  changeBlockedStatus(block), // if true, user will be blocked. if false, user will be unblocked
         *  changeNickname(nick, threadID) // sets the user's nickname
         * }
         */
        context.thread.sendMessage(message.body);
    }
})