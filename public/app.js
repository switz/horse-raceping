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
      $.ajax('/api/v1/name', {
          type: 'POST' 
        , data: {name: $('#name').val()}
        // TODO make async
        , async: false
        , success: function(data, textStatus) {
            if (textStatus === 'success') {
              App.user = data;
            }
          }
      });
      console.log(App.user);
    }
  });

  var Login = new App.Login.LoginView();
});
