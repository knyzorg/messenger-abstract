# Unstable af

This repository is not stable. I would suggest not using it in a production setting but damn, don't use it AT ALL for now.

# Messenger Events

Messenger Events is an abstraction layer over the more popular [`facebook-chat-api`](https://github.com/Schmavery/facebook-chat-api/) and has as an objective to simplify the library and make it overall more consistent through embracing immutable Object-Oriented design.

Performance is at best a consideration in this project and is sacrificed on every turn in favor of making the library easier to use. This library is not recommended for projects relying on quick response times.

**This library abstracts nearly everything you will need so you don't have to!**

# Cleaner Syntax  
The following is a short program to receive a message, react to it, log the user's nickname (if any) as well as his real name and send him a private message.

```js
require("messenger-events")
    ({email: "FB_EMAIL", password: "FB_PASSWORD"},
    (success, $) => {
        if (!success) return console.log($);

        $.handlers.message((context, message) => {
            message.react(":haha:");
            console.log(context.user.nickname, context.user.name);
            context.user.sendMessage("Hey!")
        })
    })
```

## Directly interface with `facebook-chat-api`

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