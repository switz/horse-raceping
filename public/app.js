$(function() {
  var socket = io.connect('http://localhost');
  var App = _.extend({
      Login : {Views:{}}
    , Game : {
        Views:{}
      }
    , user : null
  }, Backbone.Events);
  var gameStarted = false;
  
  App.Login.Views.LoginForm = Backbone.View.extend({
    el: '#main',
    events: {
      'submit #start-form' : 'enterGame'
    },
    initialize: function() {
      this.render();
    },
    render: function() {
      var template = _.template($('#start-template').html());
      $('#main').empty().html(template({}));
      return this;
    },
    enterGame: function() {
      var name = $('#name').val();
      $.post('/api/v1/name?name='+name, function(data) {
        App.user = new App.Game.User(data);
        // setup layout for game;
        var layout = _.template($('#layout-template').html());
        $('#main').empty().html(layout({}));
        App.layout = {
            $racerList : $('#racer-list-container')
          , $betsPanel : $('#bets-panel-container')
          , $horseInfoList : $('#horse-info-list-container')
          , $userList : $('#user-list-container')
        };
        $.get('/api/v1/horses', function(data) {
          // TODO do we want to put these on App?

          var horses = new Backbone.Collection(data);
          var lol = new App.Game.Views.RacerList({collection:horses});
          var lol2 = new App.Game.Views.HorseInfoList({collection:horses});
          var lol3 = new App.Game.Views.BetsPanel();
          App.users = new App.Game.Views.UsersPanel(new Backbone.Collection());

        });
      });
      return false;
    }
  });

  App.Game.User = Backbone.Model.extend({
    idAttribute: '_id'
  });

  App.Game.Users = Backbone.Collection.extend({
    model: App.Game.User
  });
  
  App.Game.Views.RacerList = Backbone.View.extend({
    tagName: 'div',
    url: '/api/v1/horses',
    initialize: function() {
      this.render();
    },
    render: function() {
      var self = this;
      this.collection.each(function(horse) {
        var view = new App.Game.Views.Racer({model: horse});
        self.$el.append(view.render().el);
      });
      App.layout.$racerList.empty().html(this.el);
      return this;
    }
  });

  App.Game.Views.Racer = Backbone.View.extend({
    tagName: 'div',
    className: 'span2',
    render: function() {
      var template = _.template($('#racer-template').html());
      this.$el.html(template(this.model.toJSON()));
      return this;
    }
  });

  App.Game.Views.Track = Backbone.View.extend({
    initialize: function() {
      for (var i = 0; i < 6; i++) {
        var wall = document.createElement('div');
        var horse = document.createElement('div');
        this.$el.append(wall);
      }
    }
  });

  App.Game.Views.BetsPanel = Backbone.View.extend({
    selected: null,
    betted: false,
    events: {
      'click #confirm': 'placeBet'
    },
    initialize: function() {
      this.render();
      var self = this;
      App.on('horseInfoItem:select', function(horse) {
        if (self.betted === false) {
          self.selected = horse;
          self.render();
        }
      });
    },
    render: function() {
      if (!this.betted) {
        if (this.selected === null) {
          this.$el.html('Select a racehorse to bet on');
        } else {
          var template = _.template($('#bet-set-template').html());
          // TODO convert odds to number, pass multiplier to template
          this.$el.html(template({oddsMult:1, horse:this.selected.toJSON()}));
        }
      } else {
        this.$el.html('You have $' + App.user.get('bet') + ' bet on ' + this.selected.get('name') + '.');
      }
      App.layout.$betsPanel.empty().html(this.el);
      this.delegateEvents();
    },
    placeBet: function() {
      this.betted = true;
      App.bet = true;
      var bet = $('#slider').val();
      var horse = this.selected.toJSON();
      App.user.set('bet', bet);
      socket.emit('bet', {
        user: App.user,
        bet: bet,
        horse: horse
      });
      this.render();
      return false;
    }
  });

  App.Game.Views.UsersPanel = Backbone.View.extend({
    tagName: 'div',
    collection: new App.Game.Users(),
    initialize: function() {
      this.render();
    },
    render: function() {
      var self = this;
      this.collection.each(function(user) {
        var view = new App.Game.Views.UserItem({model: user});
        self.$el.append(view.render().el);
      });
      App.layout.$userList.empty().html(this.el);
      return this;
    }
  });

  App.Game.Views.UserItem = Backbone.View.extend({
    tagName: 'div',
    render: function() {
      var template = _.template($('#user-item-template').html());
      this.$el.html(template(this.model.toJSON()));
      return this;
    }
  })

  App.Game.Views.HorseInfoItem = Backbone.View.extend({
    tagName: 'div',
    className: 'bet',
    events: {
      click : 'select'
    },
    select: function() {
      App.trigger('horseInfoItem:select', this.model);
      if (App.bet)
        return;
      $('.selected').removeClass('selected');
      this.$el.addClass('selected');
    },
    render: function() {
      var template = _.template($('#horse-info-item-template').html());
      this.$el.html(template(this.model.toJSON()));
      return this;
    }
  });

  App.Game.Views.HorseInfoList = Backbone.View.extend({
    tagName: 'div',
    url: '/api/v1/horses',
    initialize: function() {
      this.render();
    },
    render: function() {
      var self = this;
      this.collection.each(function(horse) {
        var view = new App.Game.Views.HorseInfoItem({model: horse});
        self.$el.append(view.render().el);
      });
      App.layout.$horseInfoList.empty().html(this.el);
      return this;
    }
  });

  var Login = new App.Login.Views.LoginForm();

  socket.on('startGame', function (startGame) {
    if (startGame)
      gameStarted = true;
  });
  socket.on('new_bet', function (data) {
    App.users.collection.add(data);
    App.users.render();
  })
});
