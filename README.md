# Messenger Events

## Summary

Messenger Events is a thin abstraction layer over the more popular [`facebook-chat-api`](https://github.com/Schmavery/facebook-chat-api/) and has as an objective to simplify the library and make it overall more consistent through embracing immutable Object-Oriented design while at the same time enabling backward compatibility with the underlying library.

Performance is at best a consideration in this project and is sacrificed on every turn in favor of making the library easier to use. This library is not recommended for projects relying on quick response times and instead favors more complex use cases such as building a messenger clone.

**This library abstracts nearly everything you will need so you don't have to!**

## Feature Support

### Incomplete Features

The following are features which either feature no, or insufficient support but will have first-class support.

- Abstraction for sending stickers
- Abstraction for sending files
- Abstraction for sending pictures
- Abstraction for handling received files
- Abstraction for handling received pictures
- Thread lists
- Thread history
- onReaction events (Facebook does not report the actual message to which someone reacted, but just the ID. It is possible to find out the message but will require the parsing of the thread until the messsage id is found)

### Unsupported Features

The following are features which will, at best, feature second-class support and worst, not be implemented. If `facebook-chat-api` supports a feature in this list, you can still use it by using it directly. Conversely, some in this list are not supported *because* they lack support and will be implemented if it changes.

- Animated stickers (Reason: Messenger uses sprites and math to animate stickers. This is a massive pain.)
- Calling (Reason: [Not supported by dependency in issue #472](https://github.com/Schmavery/facebook-chat-api/issues/472) )
- `GetFriendsList()` method (Reason: [Read the response to my PR](https://github.com/Schmavery/facebook-chat-api/pull/536), if you are curious, Messenger Events is using my fork instead of the official repo until it is fixed)

## Features

### Cleaner Code

The following is a short program written with Messenger Events.

```js
// Import module
require("messenger-events")
    // Authenticate
    ({email: "FB_EMAIL", password: "FB_PASSWORD"},
    (success, $) => {
        if (!success) return console.log($); // Log Error

        // Listen for new messages
        $.onMessage((context, message) => {
            if (message.body.toLower() == "laugh") {
                message.react(":haha:"); // React with laughing emoji
                // Address the user by his nickname if set  otherwise his real name
                let nick = context.user.nickname;
                let fullName = context.user.name;
                let addressBy =  nick ? nick : fullName;
                // Send him a private message
                context.user.sendMessage("You are so funny, " + addressBy)
            }
        })
    })
```

The following is an equivalent program written with facebook-chat-api.

```js
// Import Library
const login = require("facebook-chat-api");

// Login
login({email: "FB_EMAIL", password: "FB_PASSWORD"},(err, api) => {
    if(err) return console.error(err);

    // Listen for all events
    api.setOptions({listenEvents: true})
    api.listen((err, event) => {
        if (event.type == "message" && event.body.toLower() == "laugh"){

            // Get thread info in order to retreive nicknames (if any)
            api.getThreadInfo(event.threadID, (err, thread) => {
                let nick = thread.nicknames[event.senderID];

                // Get user info in order to retreive full name
                api.getUserInfo(event.threadID, (err, thread) => {
                    let fullName = thread.nicknames[event.senderID];
                    let addressBy = nick ? nick : fullName;

                    // React
                    api.setMessageReaction(event.messageID, ":haha:");
                    // Send message
                    api.sendMessage(event.senderID, "You are so funny, " + addressBy)
                });
            });
        }
    });
});
```

The above is a simple example thought of on a whim. It does however properly illustrate how much cleaner the code can be. The effect will be far more noticable in real projects.

### Supports multipler listeners

```js
require("messenger-events")
    ({email: "FB_EMAIL", password: "FB_PASSWORD"},
    (success, $) => {
        if (!success) return console.log($);

        $.onMessage((context, message) => {
            console.log("This will be called first")
        })
        
        $.onMessage((context, message) => {
            console.log("This will be called second")
        })
        
        $.onMessage((context, message) => {
            console.log("This will be called third")
        })
    })
```

### Directly interface with `facebook-chat-api`

To permit users more familiar with `facebook-chat-api` to gradually transition to Messenger Events as well as to allow the usage of left-out features, it exposes direct access to the API in the `$.api` object.

```js
require("messenger-events")
    ({email: "FB_EMAIL", password: "FB_PASSWORD"},
    (success, $) => {
        if (!success) return console.log($);

        var yourID = "000000000000000";
        var msg = "Hey!";
        $.api.sendMessage(msg, yourID);
  
  		// Or alternatively,
  		let api = $.api;
  		api.sendMessage(msg, yourID);
    })
```

When using the legacy `api` object directly, note that using `api.listen()`is not the *real* `api.listen()` but instead mapped to `api.legacyListen()` while the real one is at `api.realListen()`. While they are functionally the same, you must **never** use `api.realListen()` as it will break all the abstractions. A bonus of using `api.legacyListen()`, is that it allows you to reuse it multiple times as [opposed to the real listener provided by `facebook-chat-api` (Issue #525)](https://github.com/Schmavery/facebook-chat-api/issues/525). 


Please review usage examples: 

# Notice

> This project is in active development making it both not feature-complete (yet) and unstable enough to make it unsuitable for production environments. You are encouraged to remedy both of those issues.

> This project depends fully on `facebook-chat-api`, if there is a bug in their code, it **will** propagate to this package as well.