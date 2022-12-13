const shortener = require('shortid')
const validUrl = require('valid-url')
const urlModel = require('../models/urlModel')

const createShortUrl = async function(req, res){
    try {
        let data = req.body
        let { longUrl } = data

        if(!longUrl) return res.status(400).send({ status : false , message : "longUrl is required !!!"})

        if (!validUrl.isUri(longUrl)) return res.status(400).send({ status : false , message : "Invalid longUrl !!!"})

        let urlData = await urlModel.findOne({ longUrl : longUrl }).select({ longUrl : 1 , shortUrl : 1 , urlCode : 1 , _id : 0 })

        if(urlData) return res.status(200).send({ status : false , message : "Short URL is already present." , data : urlData })

        let baseUrl = "http://localhost:3000"

        let urlCode = shortener.generate()

        let shortUrl = baseUrl + '/' + urlCode

        let shortUrlData = await urlModel.findOne({ shortUrl : shortUrl , urlCode : urlCode })

        if(shortUrlData) return res.status(400).send({ status : false , message : "Please try again, the generated shortUrl already exist for another longUrl !!!"})

        data.shortUrl = shortUrl
        data.urlCode = urlCode

        let savedData = await urlModel.create(data)

        res.status(201).send({ status : true , data : savedData })

    } catch (err) {
        res.status(500).send({ status : false , message : err.message })
    }
}

const redirectShortUrl = async function(req, res){
    try {

        let url = req.params.urlCode.toLowerCase()

        let urlData = await urlModel.findOne({ urlCode : url })

        if(!urlData) return res.status(404).send({ status : false , message : "URL not found !!!" })

        res.status(302).redirect(urlData.longUrl)

    } catch (err) {
        res.status(500).send({ status : false , message : err.message })
    }
}

module.exports = { createShortUrl , redirectShortUrl }