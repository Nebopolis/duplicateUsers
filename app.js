(function() {

    return {
        events: {
            'app.activated':'init',
            'dataLoaded':'render'
        },

        requests: {
            url: function(url) { //requests a simple url - used when the URL is predefined (typically getAll())
                return {
                    'url': url
                };
            }, 


            sharingAgreements: {
                url: '/api/v2/sharing_agreements.json'
            },
            
            users: {
                url: '/api/v2/users.json'
            },

            requestedTickets: function(userID){
                return {
                    'url': helpers.fmt('/api/v2/users/%@/tickets/requested.json', userID)
                };
            }
        },

        

        init: function() {
            this.switchTo('loading');

            this.require = require('context_loader')(this);
            this.getAll = this.require('get_all');
            var that = this;
            this.getAll('sharing_agreements', ['sharingAgreements']).done(function(agreements) {
                var settings = {};
                settings.agreements = agreements;
                that.addSharingAgreements = that.require('sharing_agreements', settings);
                that.getAll('users', ['users']).done(function(users) {
                    that.generateData(users).done(function(data) {
                        that.duplicates = data;
                        that.trigger('dataLoaded');
                        console.log(data);
                    });
                });
            });
        },
        
        render: function() {
            this.switchTo('users', {userlist: this.duplicates});
        },

        generateData: function(users) {
            var duplicates = this.require('find_duplicates')(users, 'name');
            var that = this;

            return that.promise(function(done,fail) {
                var count = 0;
                duplicates.forEach(function(duplicate, index, array) {
                        that.addSharingAgreements(duplicate.users).done(function(){
                        count++;                    
                        if(count == duplicates.length) {
                            done(duplicates);
                        }
                    });
                });

            });
        },
    };

}());
