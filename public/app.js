$(function() {
  var App = {
      Login : {Views:{}}
    , Game : {
        Views:{}
      }
    , user : null
  };
  
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
        console.log(App.user);
      // setup layout for game;
      var layout = _.template($('#layout-template').html());
      $('#main').empty().html(layout({}));
      App.layout = {
        $RacerListContainer : $('#racer-list-container')
      };
      var lol = new App.Game.Views.RacerList({collection:new App.Game.Users([App.user, App.user])});
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
    tagName: 'ul',
    initialize: function() {
      this.render();
    },
    render: function() {
      var self = this;
      console.log(this.collection);
      this.collection.each(function(horse) {
        var view = new App.Game.Views.Racer({model: horse});
        self.$el.append(view.render().el);
      });
      App.layout.$RacerListContainer.empty().html(this.el);
      return this;
    }
  });

  App.Game.Views.Racer = Backbone.View.extend({
    tagName: 'li',
    render: function() {
      var template = _.template($('#racer-template').html());
      this.$el.html(template(this.model.toJSON()));
      return this;
    }
  });

  App.Game.Views.Track = Backbone.View.extend({
  });

  App.Game.Views.BetsPanel = Backbone.View.extend({
  });

  App.Game.Views.UsersPanel = Backbone.View.extend({
  });

  App.Game.Views.HorseInfoList = Backbone.View.extend({
  });


  var Login = new App.Login.Views.LoginForm();
});
