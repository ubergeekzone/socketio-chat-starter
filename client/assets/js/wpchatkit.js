(function ($) {



  $("body").on("click", ".close-room-sidebar", function(e) {
    $(this).parent().parent().hide("slide", { direction: "right" }, 1000);
    e.preventDefault();
  });

  $("body").on("click", ".open-room-sidebar", function(e) {
    $("body").find("a.close-room-sidebar").parent().parent().show("slide", { direction: "right" }, 1000);
    e.preventDefault();
  });

  //$("body").append('<div id="chat-sidebar" class="absolute bottom-0 right-0 bg-white w-1/5 border-solid border-l-2 border-t-2 p-2.5"></div>')

  var storage = {
    currentRoom: "public",
    currentUser: null
  }

  $("#inRoom").text("#" + storage.currentRoom);

  var chatroom = new WP_Chatkit();

  if (storage.currentUser === null) {
    storage.currentUser = "Guest-" + chatroom.makeID();
  }

  var username = chatroom.auth(storage.currentUser, function (username) {
    chatroom.connect(username);
    $(".currentUser").text(username);
    $(".currentUserAvatar").attr("src", "https://avatars.dicebear.com/api/initials/" + username + ".svg");
  });

  chatroom.joinRoom({
    user: username,
    room: storage.currentRoom
  }, function (data) {
    var message_html = $('.comment-blank').clone();
    $(message_html).find(".author").hide();
    $(message_html).find(".text").text(data);
    $(message_html).removeClass("comment-blank hidden").addClass("user-joined")
    $('.comments').prepend(message_html);
    console.log(data);
  });

  chatroom.disconnect(function (data) {
    var message_html = $('.comment-blank').clone();
    $(message_html).find(".author").hide();
    $(message_html).find(".text").text(data);
    $(message_html).removeClass("comment-blank hidden");
    $('.comments').prepend(message_html);
  });

  chatroom.onlineUsers(function (online) {
    //$("#chat-sidebar").empty();
   $('.online-users div:not(.user-template)').remove();
    
    console.log(online);
    $.each(online, function (index, user) {
      if (user.username !== storage.currentUser) {
        var template =  $(".online-users").find(".user-template").clone().removeClass("user-template");
        template.find("a").text(user.username).attr("href", user.username + "-" + username).addClass("item text-gray-500");
        template.find("img").attr("src",  "https://avatars.dicebear.com/api/initials/"+user.username+".svg").addClass("item text-gray-500");
        $(template).removeClass("hidden").prependTo(".online-users");

        //$("#chat-sidebar").prepend($("<a/>").text(user.username).attr("href", user.username + "-" + username).attr("data-pos", index).addClass("item text-gray-500 flex items-center mb-3 px-4"));
      }
    });
  });

  chatroom.messages(function (message) {
    if (message.type === "c") {
      var message_html = $('.comment-blank').clone();
      $(message_html).find(".author").text(message.user);
      $(message_html).find(".text").html(message.msg);
      $(message_html).find(".currentUserAvatar").attr("src", "https://avatars.dicebear.com/api/initials/"+message.user+".svg");
      $(message_html).removeClass("comment-blank hidden").addClass("comment");
      $('.comments').prepend(message_html);
    } else if (message.type === "d") {
      if (message.user !== storage.currentUser) {
        console.log($('[rel="' + message.user + '"]').length);
        if (!$('[rel="' + message.user + '"]').length) {
          $('[href="' + message.user + "-" + message.room + '"]').click();
        } else if ($('[rel="' + message.user + '"]').length) {
          $('[rel="' + message.user + '"]').show();
        }
        $('<div class="msg-right">' + message.msg + '</div>').insertBefore('[rel="' + message.user + '"] .msg_push');
        $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
      } else {
        $('<div class="msg-right">' + message.msg + '</div>').insertBefore('[rel="' + message.room + '"] .msg_push');
        $('.msg_body').scrollTop($('.msg_body')[0].scrollHeight);
      }

    }
  });

  $('body').on("focus", ".input", function(e) {
    $(this).empty()
  });

  $('body').on("keypress", ".input", function(e) {
    if(e.which == 13 && !e.shiftKey) {
      $(".send-message svg").click();
      e.preventDefault();
      $(this).empty()
    }
  });

  $(".send-message svg").on("click", function (e) {
    chatroom.sendMessage({
      user: username,
      msg: $(".input").html(),
      room: storage.currentRoom,
      type: "c"
    })
    //$(".input").data("emojioneArea").setText('');
    $(".input").empty()
  });

  $('body').on('click', '.rooms a', function (e) {
    var __this = $(this);
    room = __this.attr("href");
    storage.currentRoom = room;
    $("#inRoom").text("#" + storage.currentRoom);
    $('.comment, .user-joined').remove();

    chatroom.changeRoom({
      room: room
    }, function (data) {
      console.log(data);
      console.log(room);
    });
    e.preventDefault();
  });

  $('body').on('click', '.online-users .menu .item', function (e) {
    e.preventDefault();
    var __this = $(this);
    room = __this.attr("href");
    if (room === username + "-" + username) {
      alert("you can not direct message yourself.");
      return;
    }
    storage.currentRoom = room;
    $("#inRoom").text("#" + storage.currentRoom);
    $('.comment, .user-joined').remove();
    chatroom.changeRoom({
      room: room
    }, function (data) {
      console.log(data);
    });
  });

  $(document).ready(function () {
    /*$("input").emojioneArea();*/
  });

  var arr = []; // List of users 

  $(document).on('click', '.msg_head', function () {
    var chatbox = $(this).parents().attr("rel");
    $('[rel="' + chatbox + '"] .msg_wrap').slideToggle('slow');
    return false;
  });


  $(document).on('click', '.close', function () {
    var chatbox = $(this).parents().parents().attr("rel");
    $('[rel="' + chatbox + '"]').hide();
    arr.splice($.inArray(chatbox, arr), 1);
    displayChatBox();
    return false;
  });

  $(document).on('click', '#chat-sidebar a', function (e) {

    var userID = $(this).attr("data-pos");
    var username = $(this).text();

    if ($.inArray(userID, arr) != -1) {
      arr.splice($.inArray(userID, arr), 1);
    }

    arr.unshift(userID);
    chatPopup = '<div class="msg_box" style="right:270px" rel="' + username + '" data-pos="' + userID + '">' +
      '<div class="msg_head">' + username +
      '<div class="close">x</div> </div>' +
      '<div class="msg_wrap"> <div class="msg_body"> <div class="msg_push"></div> </div>' +
      '<div class="msg_footer"><textarea class="msg_input" rows="4"></textarea></div>  </div>  </div>';

    $("body").append(chatPopup);
    displayChatBox();

    e.preventDefault();
  });


  $(document).on('keypress', 'textarea', function (e) {


    if (e.keyCode == 13) {
      var msg = $(this).val();
      $(this).val('');
      if (msg.trim().length != 0) {
        var chatbox = $(this).parents().parents().parents().attr("rel");

        chatroom.sendMessage({
          user: username,
          msg: msg,
          room: chatbox,
          type: "d"
        })


      }
    }
  });



  function displayChatBox() {
    i = 400; // start position
    j = 390; //next position

    $.each(arr, function (index, value) {
      if (index < 4) {
        $('.msg_box[data-pos="' + value + '"]').css("right", i);
        $('.msg_box[data-pos="' + value + '"]').show();
        i = i + j - 120;
      } else {
        $('.msg_box[data-pos="' + value + '"]').hide();
      }
    });
  }

})(jQuery);