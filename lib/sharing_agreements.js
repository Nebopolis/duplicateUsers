var util = {
    version: '.01',
    agreementByID: function(agreementID) {
        var agreement;
        if(agreementID == null || agreementID === undefined) {
            return agreementID;
            
        }
        util.agreements.forEach(function(element, index, array) {
            if(element.id == agreementID) {
                agreement = element;
            }
        });
        return agreement;
    },

    setSharingAgreement: function(user) {
        return util.appFramework.promise(function(done,fail) {
            util.appFramework.ajax('requestedTickets', user.id).done(function(data) {
                var tickets = data.tickets;
                var agreementID;
                if(tickets.length === 0) {
                    agreementID = undefined;
                } else if(tickets[0].sharing_agreement_ids.length === 0) {
                    agreementID = null;
                } else {
                    agreementID = data.tickets[0].sharing_agreement_ids[0];
                }
                if(user.shared === false) {
                    agreementID = null;
                }
                var agreement = util.agreementByID(agreementID);
                user.sharing_agreement = agreement;
                    user.tickets = data;
                if(user.shared === false) {
                    user.sharing_name = 'Hub (Not shared)';
                } else if(agreement === undefined) {
                    user.sharing_name = 'Unknown agreement (no tickets)';
                } else if(agreement === null){
                    console.log(user);
                    user.sharing_name = 'Unknown error determining agreement';
                } else {
                    user.sharing_name = agreement.name;
                }
                done();
            });
        });
    },
};

module.exports = {

    factory: function(context, settings) {
        util.appFramework = context;
        util.agreements = settings.agreements;
        return this.addSharingAgreements;
    },

    addSharingAgreements: function(users) {
        return util.appFramework.promise(function(done, fail) {
            var count = 0;
            users.forEach(function(user, index, array) {
                util.setSharingAgreement(user).done(function() {
                    count++;
                    if(count == users.length) {
                        done();
                    }
                });                 
            });
        });
    }
};


