$(function() {
  var App = {
      Login : {}
    , Game : {}
  };
  
  App.Login.LoginView = Backbone.View.extend({
    events: {
      'click #start' : 'startGame'
    },
    initialize: function() {
      this.render();
    },
    render: function() {
      var template = _.template($('#start-template').html());
      $('#main').empty().html(template({}));
      return this;
    },
    startGame: function() {
      console.log('started');
    }
  });

  var Login = new App.Login.LoginView();
});
