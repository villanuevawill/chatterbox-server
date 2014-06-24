var app = {

  init: function () {
    app.displayUserName();
    // app.fetch();
    app.initEventHandlers();
    // setInterval(function() {
    //   app.fetch();
    // }, 2000);
  },

  _activeChatRoom: false,

  numMessagesDisplayed: 10,

  _server: 'http://127.0.0.1:3000/classes/messages',

  _roomList: {},

  _friendList: {},

  renderRoom: function(room) {
    var source = $('#room-template').html();
    var template = Handlebars.compile(source);
    return template({roomname: room});
  },

  updateChatRooms: function(allChats) {
    for (var i = 0 ; i < allChats.length ; i++ ) {
      var room = allChats[i].roomname;
      if ( app._roomList[room] === undefined && app.stringIsClean(room) ) {
        app._roomList[room] = true;
        $('#roomSelect').append(app.renderRoom(room));
      }
    }
  },

  addFriend: function(username) {
    if (app._friendList[username] === undefined) {
      app._friendList[username] = true;
      app.highlightFriends();

      var source = $('#friend-template').html();
      var template = Handlebars.compile(source);
      var html = template({username: username});
      $('#friendSelect').append(html);
    }
  },

  highlightFriends: function() {
    $('#chats .username').each(function(key, val) {
      for (var friend in app._friendList) {
        if ($(val).text() ===  friend) {
          $(val).closest('.chat.panel').removeClass('panel-info').addClass('panel-success');
        }
      }
    });
  },

  getUserName: function() {
    return window.location.search.split('username=')[1];
  },

  displayUserName: function() {
    var userName = app.getUserName();
    $('#send .name').text(userName);
  },

  fetch: function() {
    $.ajax({
      url: app._server,
      type: 'GET',
      data: 'order=-createdAt',
      success: function(data) {
        app.addNewMessages(data.results, app.numMessagesDisplayed);
        app.updateChatRooms(data.results);
      },
      error: function() { throw 'Could not fetch messages'; }
    });
  },

  renderMessage: function(messageData) {
    if (app.messageIsClean(messageData)) {
      var context = messageData;
      context.time = moment(context.createdAt).fromNow();
      var source = $('#message-template').html();
      var template = Handlebars.compile(source);
      return template(context);
    }
  },

  addNewMessages: function(messagesData, count) {
    $('.room-title').text(app._activeChatRoom || 'All Rooms');
    app.clearMessages();
    if (!app._activeChatRoom) {
      for (var i = 0 ; i < count ; i++ ) {
        $('#chats').append(app.renderMessage(messagesData[i]));
      }
    } else {
      for (var i = 0 ; i < messagesData.length ; i++) {
        if ( messagesData[i].roomname === app._activeChatRoom ) {
          $('#chats').append(app.renderMessage(messagesData[i]));
        }
      }
    }
    app.highlightFriends();
  },

  clearMessages: function() {
    $('#chats').children().remove();
  },

  createMessage: function() {
    var sendMsg = {
      'username': app.getUserName(),
      'text': $('#send #message').val(),
      'roomname': (app._activeChatRoom || 'default room')
    };
    return sendMsg;
  },

  send: function(message) {
    $.ajax({
      url: app._server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      dataType: 'json',
      success: function() {
        $('#send #message').val('');
        // app.fetch();
      },
      error: function() {
        throw 'Could not send message';
      }
    });
  },

  messageIsClean: function(msg) {
    for (var key in msg) {
      if ( !app.stringIsClean(msg[key]) ) {
        return false;
      }
    }
    return true;
  },

  stringIsClean: function(string) {
    if ( typeof string !== 'string' || (string.indexOf('<') + string.indexOf('>') > -2)) {
      return false;
    }
    return true;
  },

  initEventHandlers: function() {
    $('#send').on('submit', function(e) {
      e.preventDefault();
      app.send(app.createMessage());
    });
    $('body').on('click', '.room', function(e) {
      e.preventDefault();
      var room = $(this).text();
      room === 'All Rooms' ? (app._activeChatRoom = false) : (app._activeChatRoom = room);
      $('.room').removeClass('active');
      $(this).addClass('active');
      app.fetch();
    });
    $('#add-room').click(function(e) {
      e.preventDefault();
      var $room = $('#add-room').parent().prev('div').find('input');
      $('#roomSelect').prepend(app.renderRoom($room.val()));
      $room.val('');
    });
    $('body').on('click', '.chat .username', function(e) {
      var friend = $(this).text();
      app.addFriend(friend);
    });
  }
};

$(function() {
  app.init();
});
