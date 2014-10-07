(function() {

    return {
        events: {
            'app.activated':'init',
            'dataLoaded':'render',
            'click .status-toggle': 'viewMerge',
            'click .merge-into': 'selectUsers',
            'click .merge-cancel': 'cancel', 
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
            },

            mergeUsers: function(winnerID, mergedID) {
                return {
                    url: helpers.fmt('/api/v2/users/%@/merge.json', mergedID),
                    dataType: 'JSON',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        "user": {
                            "id": winnerID,
                        }
                    })
                };
            },
        },

        getSelected: function(index) {
            var filter = "input.merge_user_" + index + ":checked";   
            var checked = this.$(filter);
            for(var i = 0; i < checked.length; i++) {
            }            
            return checked;            
        },

        mergeUsers: function(winnerID, mergedIDs) {
            var that = this;
            mergedIDs.forEach(function(mergedID, index, arr) {
                that.ajax('mergeUsers', winnerID, mergedID).done(function() {
                    services.notify("Merged " + mergedID + " into " + winnerID);
                });
            });
        },

        selectUsers: function(e) {
            var arrID = e.currentTarget.value;
            var winnerID = e.currentTarget.id;
            var dupUsers = this.duplicates[arrID].users;

            var checked = this.getSelected(arrID);

            var merged = [];
            var mergedIDs = [];

            for(var i = 0; i < checked.length; i++) {
                if(checked[i].id !== winnerID){
                    merged.push(dupUsers[checked[i].value]);
                    mergedIDs.push(checked[i].id);
                }
            }
            merged.forEach(function(user, index, array) {
                dupUsers.splice(dupUsers.indexOf(user),1);
            });

            this.mergeUsers(winnerID, mergedIDs);

            this.duplicates[e.currentTarget.value].merge = false;
            this.render();
        },

        viewMerge: function(e) {
            this.duplicates[e.currentTarget.value].merge = true;
            this.render();
        },

        cancel: function(e) {
            this.duplicates[e.currentTarget.value].merge = false;
            this.render();
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
                    duplicate.users.forEach(function(user) {
                        user.duplicate_index = index;
                    });
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
