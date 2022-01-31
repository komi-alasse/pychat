async function add_messages(msg) {
    if (typeof msg.name !== "undefined") {
      let time;

      time = (typeof msg.time !== "undefined") ? msg.time : dateNow(); 

      let globalName = await get_name();
  
      let content =
        '<div class="container">' +
        '<b style="color:#002" class="right">' +
        msg.name +
        "</b><p>" +
        msg.message +
        '</p><span class="time-right">' +
        time +
        "</span></div>";
      
        // Check if user is the one who sent the message.
        if (globalName == msg.name) {
        content =
          '<div class="container userchatbox">' +
          '<b style="color:#002" class="left">' +
          msg.name +
          "</b><p>" +
          msg.message +
          '</p><span class="time-left">' +
          time +
          "</span></div>";
      }
      // update div with the message content.
      let messageDiv = document.getElementById("messages");
      messageDiv.innerHTML += (content);
    }
      scroll("messages");
  }
  
  async function get_name() {
    return await fetch("/get_name")
      .then(async function (response) {
        return await response.json();
      })
      .then(function (text) {
        return text["name"];
      });
  }
  
 
  
  $(function () {
    $(".msgs").css({ height: $(window).height() * 0.5 + "px" });
  
    $(window).bind("resize", function () {
      $(".msgs").css({ height: $(window).height() * 0.5 + "px" });
    });
  });
  
  function scroll(mbox) {
    let container = document.getElementById(mbox);
    $("#" + mbox).animate(
      { scrollTop: container.scrollHeight - container.clientHeight }
    );
  }
 
  function dateNow() {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date+' '+time;
  }

  // Main thread that connects both clients to the server.
  var socket = io.connect("http://" + document.domain + ":" + location.port);
  socket.on("connect", async function () {
    let usr_name = await get_name();
    if (usr_name != "") {
      socket.emit("event", {
        message: usr_name + " just connected to the server!",
        connect: true,
      });
    }

    let form = $("form#msgform").on("submit", async function (event) {
      event.preventDefault();

      // get input from user.
      let msg_input = document.getElementById("msg");
      let user_input = msg_input.value;

      // get the name of the user from login screen.
      let user_name = await get_name();
  
      // clear the current msg box.
      msg_input.value = "";
  
      // send message to other clients connected to the server.
      socket.emit("event", {
        message: user_input,
        name: user_name,
      });
    });
  });
  
  socket.on("disconnect", async function (msg) {
    let usr_name = await get_name();
    socket.emit("event", 
    // Message object to send.
    { message: usr_name + " just left the server..." }
    );
  });
  
  socket.on("message response", function (msg) {
    add_messages(msg);
  });
  
  