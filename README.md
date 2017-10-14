# Messenger Events

Messenger Events is a thin abstraction layer over the more popular [`facebook-chat-api`](https://github.com/Schmavery/facebook-chat-api/) and has as an objective to simplify the library and make it overall more consistent through embracing immutable Object-Oriented design while at the same time enabling backward compatibility with the underlying library.

Performance is at best a consideration in this project and is sacrificed on every turn in favor of making the library easier to use. This library is not recommended for projects relying on quick response times and instead favors more complex use cases such as building a messenger clone.

**This library abstracts nearly everything you will need so you don't have to!**

# Feature Support

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
- `GetFriendsList()` method (Reason: [Read the response to my PR](https://github.com/Schmavery/facebook-chat-api/pull/536), if you are curious, Messenger Events is using my fork instead of the official repo until it is fixed)Cleaner Syntax

## Features

### Cleaner Code  
The following is a short program to receive a message, react to it, log the user's nickname (if any) as well as his real name and send him a private message.

```js
require("messenger-events")
    ({email: "FB_EMAIL", password: "FB_PASSWORD"},
    (success, $) => {
        if (!success) return console.log($);

        $.onMessage((context, message) => {
            message.react(":haha:");
            console.log(context.user.nickname, context.user.name);
            context.user.sendMessage("Hey!")
        })
    })
```
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
require("./messenger-events")
    ({email: "FB_EMAIL", password: "FB_PASSWORD"},
    (success, $) => {
        if (!success) return console.log($);

        var yourID = "000000000000000";
        var msg = "Hey!";
        $.api.sendMessage(msg, yourID);
    })
```

When using the legacy `api` object directly, note that using `api.listen` will break this library by hijacking the listener away from Messenger Events. To listen to events directly, use `$.legacyListen()` which is functionally identical apart from allowing multiple functions to use at the same time.

# Notice

> This project is in active development making it both not feature-complete (yet) and unstable enough to make it unsuitable for production environments. You are encouraged to remedy both of those issues.

> This project depends fully on `facebook-chat-api`, if there is a bug in their code, it **will** propagate to this package as well.