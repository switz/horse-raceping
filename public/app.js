$(function() {
  var App = {
      Login : {}
    , Game : {}
    , user : null
  };
  
  App.Login.LoginView = Backbone.View.extend({
    el: '#main',
    events: {
      'click #start' : 'enterGame'
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
    }
  });

  App.Game.User = Backbone.Model.extend({
    idAttribute: '_id'
  });

  App.Game.Users = Backbone.Collection.extend({
    model: App.Game.User
  });

  var Login = new App.Login.LoginView();
});
