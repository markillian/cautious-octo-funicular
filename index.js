// CCCS-425-754 Final Project Part 1
// Submitted by Marc Léonard

const express = require("express");
const app = express();

let bodyParser = require("body-parser");
app.use(bodyParser.raw({ type: "*/*" }));

const cors = require("cors");
app.use(cors());

let morgan = require("morgan");
app.use(morgan("combine"));

// Required as per teacher for sourcecode extraction
app.get("/sourcecode", (req, res) => {
  res.send(
    require("fs")
      .readFileSync(__filename)
      .toString()
  );
});

var usernames = [""];
var passwords = [""];
var tokens = [""];
var channels = [""];
var channelOwner = [""];
var channelMembers = [""];
var channelBanned = [""];
var messages = [{"channel":"test channel","from":"bobinette","contents":"this is a test"}];

app.post("/signup", (req, res) => {
  console.log("request to /signup received");

  let creds = JSON.parse(req.body);
  // console.log(creds);
  // console.log("Username is " + creds.username);
  // console.log("Password is " + creds.password);

  // if (creds.username == null || creds.password == null) {
  if (creds.username == null) {
    res.status(200).send({ success: false, reason: "username field missing" });
  } else if (creds.password == null) {
    res.status(200).send({ success: false, reason: "password field missing" });
  } else {
    if (usernames.includes(creds.username)) {
      res.status(200).send({ success: false, reason: "Username exists" });
    } else {
      // console.log("adding to arrays");
      usernames.push(creds.username);
      passwords.push(creds.password);
      tokens.push("");
      res.status(200).send({ success: true });
    }
  }
});

app.post("/login", (req, res) => {
  console.log("request to /login received");

  let creds = JSON.parse(req.body);

  if (creds.username == null) {
    res.status(200).send({ success: false, reason: "username field missing" });
  } else if (creds.password == null) {
    res.status(200).send({ success: false, reason: "password field missing" });
  } else {
    if (usernames.includes(creds.username)) {
      var i = usernames.indexOf(creds.username);
      if (creds.password == passwords[i]) {
        // Create token... revisit, make this a function? ------------------
        var randomtoken = "";
        var possible = "abcdefghijklmnopqrstuvwxyz";
        for (var r = 0; r < 7; r++) {
          randomtoken += possible.charAt(
            Math.floor(Math.random() * possible.length)
          );
        }
        // insert token at specific index of array
        tokens[i] = randomtoken;
        res.status(200).send({ success: true, token: randomtoken });
      } else {
        res.status(200).send({ success: false, reason: "Invalid password" });
      }
    } else {
      // console.log("username not found");
      res.status(200).send({ success: false, reason: "User does not exist" });
    }
  }
});

app.post("/create-channel", (req, res) => {
  console.log("request to /create-channel received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("channelName: " + name.channelName);

  if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else if (name.channelName == null) {
    res
      .status(200)
      .send({ success: false, reason: "channelName field missing" });
  } else {
    if (tokens.includes(token)) {
      if (channels.includes(name.channelName)) {
        res
          .status(200)
          .send({ success: false, reason: "Channel already exists" });
      } else {
        console.log("Adding " + name.channelName + " to Channels arrays");
        channels.push(name.channelName);
        var i = tokens.indexOf(token);
        channelOwner.push(usernames[i]);
        // channelMembers.push(usernames[i]);
        channelMembers.push("");
        channelBanned.push("");
        res.status(200).send({ success: true });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/join-channel", (req, res) => {
  console.log("request to /join-channel received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("channelName: " + name.channelName);

  if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else if (name.channelName == null) {
    res
      .status(200)
      .send({ success: false, reason: "channelName field missing" });
  } else {
    if (tokens.includes(token)) {
      if (channels.includes(name.channelName)) {
        var i = channels.indexOf(name.channelName);
        var y = tokens.indexOf(token);
        if (channelMembers[i].includes(usernames[y])) {
          res
            .status(200)
            .send({ success: false, reason: "User has already joined" });
        } else {
          if (channelBanned[i].includes(usernames[y])) {
            res.status(200).send({ success: false, reason: "User is banned" });
          } else {
            let newMembers = channelMembers[i] + "," + usernames[y];
            channelMembers[i] = newMembers;
            res.status(200).send({ success: true });
          }
        }
      } else {
        res
          .status(200)
          .send({ success: false, reason: "Channel does not exist" });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/leave-channel", (req, res) => {
  console.log("request to /leave-channel received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("channelName: " + name.channelName);

  if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else if (name.channelName == null) {
    res
      .status(200)
      .send({ success: false, reason: "channelName field missing" });
  } else {
    if (tokens.includes(token)) {
      if (channels.includes(name.channelName)) {
        var i = channels.indexOf(name.channelName);
        var y = tokens.indexOf(token);
        if (channelMembers[i].includes(usernames[y])) {
          // console.log("Channel Members Before: " + channelMembers[i])
          let newMembers = channelMembers[i].replace("," + usernames[y], "");
          channelMembers[i] = newMembers;
          // console.log("Channel Members After: " + channelMembers[i])
          res.status(200).send({ success: true });
        } else {
          res.status(200).send({
            success: false,
            reason: "User is not part of this channel"
          });
        }
      } else {
        res
          .status(200)
          .send({ success: false, reason: "Channel does not exist" });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.get("/joined", (req, res) => {
  console.log("request to /joined received");
  console.log(req.query.channelName);

  let token = req.headers.token;

  if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else if (req.query.channelName == null) {
    res
      .status(200)
      .send({ success: false, reason: "channelName field missing" });
  } else {
    if (channels.includes(req.query.channelName)) {
      var i = channels.indexOf(req.query.channelName);
      var y = tokens.indexOf(token);
      if (tokens.includes(token)) {
        if (channelMembers[i].includes(usernames[y])) {
          var members = channelMembers[i].split(",").filter(Boolean);
          res.status(200).send({ success: true, joined: members });
        } else {
          res.status(200).send({
            success: false,
            reason: "User is not part of this channel"
          });
        }
      } else {
        res.status(200).send({ success: false, reason: "Invalid token" });
      }
    } else {
      res
        .status(200)
        .send({ success: false, reason: "Channel does not exist" });
    }
  }
});

app.post("/delete", (req, res) => {
  console.log("request to /delete received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("channelName: " + name.channelName);

  if (name.channelName == null) {
    res
      .status(200)
      .send({ success: false, reason: "channelName field missing" });
  } else if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      if (channels.includes(name.channelName)) {
        var i = channels.indexOf(name.channelName);
        var y = tokens.indexOf(token);
        console.log("owner: " + channelOwner[i]);
        console.log("owner: " + usernames[y]);
        if (channelOwner[i].includes(usernames[y])) {
          // delete channel -------------------------------------------------------
          if (i > -1) {
            channels.splice(i, 1);
            channelOwner.splice(i, 1);
            channelMembers.splice(i, 1);
            channelBanned.splice(i, 1);
          }

          console.log("deleting channel: " + name.channelName);
          res.status(200).send({ success: true });
        } else {
          res.status(200).send({
            success: false,
            reason: "User is not part of this channel"
          });
        }
      } else {
        res
          .status(200)
          .send({ success: false, reason: "Channel does not exist" });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/kick", (req, res) => {
  console.log("request to /kick received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("channelName: " + name.channelName);

  if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else if (name.channelName == null) {
    res
      .status(200)
      .send({ success: false, reason: "channelName field missing" });
  } else if (name.target == null) {
    res.status(200).send({ success: false, reason: "target field missing" });
  } else {
    if (tokens.includes(token)) {
      if (channels.includes(name.channelName)) {
        var i = channels.indexOf(name.channelName);
        var y = tokens.indexOf(token);
        // console.log("Channel owner: " + channelOwner[i]);
        // console.log("Requestor: " + usernames[y]);
        if (channelOwner[i].includes(usernames[y])) {
          if (channelMembers[i].includes(name.target)) {
            // console.log("Channel Members Before: " + channelMembers[i]);
            let newMembers = channelMembers[i].replace("," + name.target, "");
            channelMembers[i] = newMembers;
            // console.log("Channel Members After: " + channelMembers[i]);
            res.status(200).send({ success: true });
          } else {
            res.status(200).send({
              success: false,
              reason: "User is not part of this channel"
            });
          }
        } else {
          res.status(200).send({
            success: false,
            reason: "Channel not owned by user"
          });
        }
      } else {
        res
          .status(200)
          .send({ success: false, reason: "Channel does not exist" });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/ban", (req, res) => {
  console.log("request to /ban received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("channelName: " + name.channelName);

  if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else if (name.channelName == null) {
    res
      .status(200)
      .send({ success: false, reason: "channelName field missing" });
  } else if (name.target == null) {
    res.status(200).send({ success: false, reason: "target field missing" });
  } else {
    if (tokens.includes(token)) {
      if (channels.includes(name.channelName)) {
        var i = channels.indexOf(name.channelName);
        var y = tokens.indexOf(token);
        // console.log("Channel owner: " + channelOwner[i]);
        // console.log("Requestor: " + usernames[y]);
        if (channelOwner[i].includes(usernames[y])) {
          if (channelMembers[i].includes(name.target) || channelOwner[i].includes(usernames[y]) ) {
            // console.log("Channel Banned Members Before: " + channelBanned[i]);
            let newBanned = channelBanned[i] + "," + name.target;
            channelBanned[i] = newBanned;
            // console.log("Channel Banned Members After: " + channelBanned[i]);

            res.status(200).send({ success: true });
          } else {
            res
              .status(200)
              .send({
                success: false,
                reason: "User is not part of this channel"
              });
          }
        } else {
          res
            .status(200)
            .send({ success: false, reason: "Channel not owned by user" });
        }
      } else {
        res
          .status(200)
          .send({ success: false, reason: "Channel does not exist" });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/message", (req, res) => {
  console.log("request to /message received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("channelName: " + name.channelName);
  // console.log("channelName: " + name.contents);

  if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else if (name.channelName == null) {
    res.status(200).send({ success: false, reason: "channelName field missing" });
  } else if (name.contents == null) {
    res.status(200).send({ success: false, reason: "contents field missing" });
  } else {
    if (tokens.includes(token)) {
      // console.log("Token validation completed, checking channel name")
      // console.log("Requested Channel name: " + name.channelName)
      // console.log("All Available Channel name: " + channels)
      if (channels.includes(name.channelName)) {
        // console.log("Channel Name validation completed")
        var i = channels.indexOf(name.channelName);
        var y = tokens.indexOf(token);
        // console.log("Channel owner: " + channelOwner[i]);
        // console.log("Requestor: " + usernames[y]);

        if (channelMembers[i].includes(usernames[y])) {
          // console.log("username: " + usernames[y]);
          // console.log("channelName: " + name.channelName);
          // console.log("channelName: " + name.contents);
          // console.log("All Messages Before: " + messages);

          // var message = new Array(3);
          // // message[0] = token;
          // message[0] = {"channel":name.channelName};
          // message[1] = {"from":usernames[y]};
          // message[2] = {"contents":name.contents};

          var message = {"channel":name.channelName,"from":usernames[y],"contents":name.contents};
          
          messages.push(message);

          // console.log("All Messages After: " + messages);
          // console.log("Messages at 0,1: " + messages[0,1]);
          // console.log("Messages at 0,2: " + messages[0,2]);

          res.status(200).send({ success: true });
        } else {
          res
            .status(200)
            .send({
              success: false,
              reason: "User is not part of this channel"
            });
        }
      } else {
        // res.status(200).send({ success: false, reason: "Channel does not exist" });
          res.status(200).send({success: false, reason: "User is not part of this channel"});
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.get("/messages", (req, res) => {
  console.log("request to /messages received");
  console.log("channelName: " + req.query.channelName);
  console.log("token: " + req.headers.token);

  let token = req.headers.token;

  if (token == null) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else if (req.query.channelName == null) {
    res
      .status(200)
      .send({ success: false, reason: "channelName field missing" });
  } else {
    if (channels.includes(req.query.channelName)) {
      var i = channels.indexOf(req.query.channelName);
      var y = tokens.indexOf(token);
      if (tokens.includes(token)) {
        if (channelMembers[i].includes(usernames[y])) {
          
          // for (var index = 0; index < messages.length; ++index) {
          //   console.log("messages at index: " + index + " message: " + messages[index]);
          //   console.log("message[index,1].channel: " + messages[index].channel);
          // };
          var listmessages = [""];
          
          Object.keys(messages).forEach(function(key) {
            // console.log(key, messages[key]);
            // console.log("message channel: " + messages[key].channel);
            // console.log("message from: " + messages[key].from);
            // console.log("message contents: " + messages[key].contents);

            if (req.query.channelName == messages[key].channel){
              var message = {"from":messages[key].from,"contents":messages[key].contents};
                listmessages.push(message);
            }
            
          });
          
          res.status(200).send({ success: true, messages: listmessages.filter(Boolean) });
          
        } else {
          res.status(200).send({
            success: false,
            reason: "User is not part of this channel"
          });
        }
      } else {
        res.status(200).send({ success: false, reason: "Invalid token" });
      }
    } else {
      res
        .status(200)
        .send({ success: false, reason: "Channel does not exist" });
    }
  }
});



app.listen(process.env.PORT || 3000)

// listen for requests :)
// const listener = app.listen(process.env.PORT, () => {
//  console.log("Your app is listening on port " + listener.address().port);
// });
