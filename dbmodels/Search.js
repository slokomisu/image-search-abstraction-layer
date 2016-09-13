var ObjectId = require('mongoose-simpledb').Types.ObjectId;

exports.schema = {
    term: String,
    when: Date
}

exports.virtuals = {
    getTerm : {
        get : function () {
            return this.term;
        }
    }, 

    getWhen : {
        get : function () {
                return this.Date.toISOString();
            }
            
        }
}
