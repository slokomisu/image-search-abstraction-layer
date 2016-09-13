var express = require('express');
var simpledb = require('mongoose-simpledb');
var Flickr = require('flickrapi'),
    flickrOptions = {
        api_key: process.env.FLICKR_APIKEY,
        secret: process.env.FLICKR_SECRET
    };









var app = express();

simpledb.init(function (err, db) {
    if (err) {
        console.log(err);
    }

    app.get('/favicon.ico', (req, res) => {
        res.sendStatus(200);
    })


    // GET /api/imagesearch/searchterms?offset={number}
    app.get('/api/imagesearch/:terms', (req, res) => {
        var searchTerms = req.params.terms;
        var offset = req.query.offset;
       if (req.query.offset === undefined) {
           offset = '10';
       }
        Flickr.tokenOnly(flickrOptions, (err, flickr) => {
            flickr.photos.search({
                text: searchTerms.split(' ').join('+'),
                per_page: offset
            }, (err, result) => {
                if (err)
                    throw err;
                var photos = []
                result.photos.photo.forEach(function (photo) {
                    var photoObj = {
                        photoUrl: "https://farm" + photo['farm'] + ".staticflickr.com/" + photo['server'] + 
                        "/" + photo['id'] + "_" + photo['secret'] + ".jpg",
                        pageUrl: "https://flickr.com/photos/" + photo['owner'] + "/" + photo['id'] + "/",
                        altText: photo['title']
                    }
                    photos.push(photoObj)
                })
                res.json({photos});
                
            })
        })

        var searchTime = new Date(Date.now()).toISOString();

        var search = new db.Search({term: searchTerms, when: searchTime});
        search.save((err) => {
            if (err) {
                console.log("Error in saving search term");
            } else {
                console.log("Search term " + search.getTerm + " sucessful");
            }
        })

        
    })

    app.get('/api/latest/imagesearch', (req, res) => {
        db.Search
        .find({}, {'_id': 0, 'term' : 1, 'when': 1})
        .sort({date: -1})
        .limit(10)
        .exec(function (err, searches) {
            res.json(searches)
        })
    })
})

app.listen(process.env.PORT || 3000);