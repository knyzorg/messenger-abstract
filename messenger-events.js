/*
 * This is an abstraction layer around facebook-chat-api to
 * allow more complex use cases such as reimplementing a
 * full-fledged chat client by injecting commonly desired
 * information such as the names of the users.
 * 
 * The syntaxic sugar comes at the cost of phasing out
 * certain features in the name of simplicity.
 */

const login = require("facebook-chat-api");
/**
 * @param {Object} auth defines the `email` and `password` to login
 * @param {Object} options Options which will be directly passed to the chat library
 * @param {requestCallback} ready Will be called when the login sequence has been completed. Callback is either (false, err) or (true, {handlers, actions}).
*/
module.exports = (auth, options, ready) => {
    function cloneObject(obj){
        return Object.assign({}, obj)
    }
    login(auth, (err, api) => {
        if (err) return ready(false, err);

        let h = {};
        let a = {};

        // Events to handle
        let placeholder = () => 0;
        h = {
            // message
            message: placeholder,
            // N/A
            status: placeholder,
            // typ
            typing: placeholder,
            // read_receipt
            seen: placeholder,
            // message_reaction
            reaction: placeholder,
            // presence
            status: placeholder,
            // sticker
            sticker: placeholder,
            // file
            file: placeholder,
            // photo
            photo: placeholder,
            // animation
            animation: placeholder,
            // share
            share: placeholder,
            // video
            video: Function
        }


        ready(true, { handlers: h, actions: a });
        api.setOptions(options)


        // Allow easy lookup of names
        let userCache = {};
        function getUserInfo(id, callback, threadContextID) {
            if (userCache[id]) {
                return callback(userCache[id])
            }
            api.getUserInfo(id, (err, obj) => {
                //console.log(obj)
                if (err) {
                    console.log(err);
                }
                userCache[id] = {};
                userCache[id].name = obj[id].name;
                userCache[id].id = id;
                userCache[id].thumb = obj[id].thumbsrc;
                userCache[id].profile = obj[id].profileUrl;
                userCache[id].isFriend = obj[id].isFriend;
                userCache[id].isBirthday = obj[id].isBirthday;
                userCache[id].gender = obj[id].gender;
                userCache[id].sendMessage = (msg, cb) => api.sendMessage(msg, id, cb)
                userCache[id].addUserToGroup = (threadID=threadContextID, cb) => api.addUserToGroup(id, threadID, cb)
                userCache[id].removeUserToGroup = (threadID=threadContextID, cb) => api.removeUserToGroup(id, threadID, cb)
                userCache[id].changeBlockedStatus = (block, cb) => api.changeBlockedStatus(id, block, cb)
                userCache[id].changeNickname = (nick, threadID=threadContextID, cb) => api.changeNickname(nick, threadID, userid, cb)
                
                callback(cloneObject(userCache[id]))
            })
            /*api.getThreadList(0,20, (err, arr)=>{
                arr.forEach((thread)=>{
                    nameIDs[thread.threadID] = thread.name;
                    if (thread.threadID == id){
                        callback(thread.name)
                    }
                })
            })*/
        }

        function updateStatus(id, statuses, timestamp) {
            getUserInfo(id, (userInfo) => {
                let status = -1;
                if ((statuses == 0 && (status = false)) || (statuses == 2 && (status = true))) {
                    // 0 means offline, 2 means online
                    if (!userInfo.status || userInfo.status.isOnline != status) {

                        // User Status Changed
                        h.status({
                            user: userInfo,
                        }, {
                                online: status,
                                timestamp: timestamp
                            })
                    }
                    userCache[id].status = {
                        isOnline: status,
                        timestamp: timestamp
                    };

                }
            })
        }

        function getThreadInfo(threadID, callback) {
            api.getThreadInfo(threadID, (err, threadInfo) => {
                if (err) return callback({})
                threadInfo.sendMessage = (msg, cb) => api.sendMessage(msg, threadID, cb)
                threadInfo.id = threadID
                threadInfo.sendTypingIndicator = (cb) => api.sendTypingIndicator(threadID, cb)
                threadInfo.changeArchivedStatus = (archive, cb) => api.changeArchivedStatus(threadID, archive, cb)
                threadInfo.changeNickname = (nick, userid, cb) => api.changeNickname(nick, threadID, userid, cb)
                threadInfo.changeThreadColor = (color, cb) => api.changeThreadColor(color, threadID, cb)
                threadInfo.changeThreadEmoji = (emoji, cb) => api.changeThreadEmoji(emoji, threadID, cb)
                threadInfo.deleteThread = (cb) => api.deleteThread(threadID, cb)
                threadInfo.getThreadHistory = (amount, timestamp, cb) => api.getThreadHistory(threadID, amount, timestamp, cb)
                threadInfo.getThreadInfo = (cb) => api.getThreadInfo(threadID, cb)
                threadInfo.getThreadPictures = (offset, limit, cb) => api.getThreadPictures(threadID, offset, limit, cb)
                threadInfo.markAsRead = (cb) => api.markAsRead(threadID, cb)
                threadInfo.muteThread = (seconds, cb) => api.muteThread(threadID, seconds, cb)


                if (!threadInfo.isCanonical) {
                    threadInfo.setTitle = (newTitle, cb) => api.setTitle(newTitle, threadID, cb)
                    threadInfo.addUserToGroup = (userid, cb) => api.addUserToGroup(userid, threadID, cb)
                    threadInfo.removeUserFromGroup = (userid, cb) => api.removeUserFromGroup(userid, threadID, cb)
                    threadInfo.changeGroupImage = (image, cb) => api.changeGroupImage(image, threadID, cb)
                    threadInfo.createPoll = (title, options, cb) => api.createPoll(title, threadID, options, cb)

                }

                // Syntaxic sugar for participants
                threadInfo.participants = [];
                threadInfo.participantIDs.forEach((id) => {
                    getUserInfo(id, (userInfo) => {
                        userInfo.nickname = threadInfo.nicknames[userInfo.id]
                        threadInfo.participants.push(userInfo);
                        if (threadInfo.participants.length == threadInfo.participantIDs.length) {
                            callback(cloneObject(threadInfo))
                        }
                    })
                })

            })
        }
        api.listen((err, $) => {
            //api.sendMessage(message.body, message.threadID);
            if (err) {
                return console.log(err)
            }
            console.log($.threadID, $.type, JSON.stringify($))
            switch ($.type) {
                case "presence":
                    updateStatus($.userID, $.statuses)
                    break;
                case "message":
                    getThreadInfo($.threadID, (threadInfo) => {
                        getUserInfo($.senderID, (userInfo) => {
                            userInfo.nickname = threadInfo.nicknames[userInfo.id]
                            h.message({
                                user: userInfo,
                                thread: threadInfo,
                            }, {
                                    id: $.messageID,
                                    body: $.body,
                                    attachments: $.attachments,
                                    react: (reaction, cb) => api.setMessageReaction(reaction, $.messageID, cb)
                                })
                            $.attachments.forEach((attachment) => {
                                switch (attachment.type) {
                                    case "sticker":
                                        h.sticker({
                                            user: userInfo,
                                            thread: threadInfo,
                                        }, {
                                                id: attachment.stickerID,
                                                url: attachment.url,
                                                size: {
                                                    height: attachment.height,
                                                    width: attachment.width
                                                }
                                            })
                                        break;
                                }

                            })
                        }, $.threadID)

                    })
                    break;
                case "typ":

                    break;
            }
        });
    });
}
