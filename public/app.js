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
        App.user = data;
        console.log(App.user);
      })
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
    el: 'ul',
    initialize: function() {
      this.collection = this.options.collection;
    },
    render: function() {
    }
  });

  App.Game.Views.Racer = Backbone.View.extend({
    el: 'li'
    
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
