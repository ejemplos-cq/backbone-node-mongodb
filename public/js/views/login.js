define(['Underscore', 'Backbone','text!templates/login.html'], function( _, Backbone, loginTemplate) {
    var loginView = Backbone.View.extend({
        el: $('#content'),
        events: {
            "submit form": "login"
        },
        login: function() {
            var datosLogin = {
                email: $('input[name=email]').val(),
                password: $('input[name=password]').val()
            };
            console.log(datosLogin);
            $.post('/login', datosLogin, function(data) {
                console.log(data);
            }).error(function() {
                $("#error").text('Unable to login.');
                $("#error").slideDown();
            });
            return false;
        },
        render: function() {
            this.$el.html(loginTemplate);
            $("#error").hide();
        }
    });
    return loginView;
});