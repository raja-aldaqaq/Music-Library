const { Category } = require('../models/Category')
const { Music } = require('../models/Music')
const { Playlist } = require('../models/Playlist')

const moment = require('moment')

exports.music_create_get = (req, res) => {
  Category.find().then((categories) => {
    res.render('music/add', { categories })
  })
}

exports.music_create_post = (req, res) => {
  console.log('File Uploads - Audio Path: ', req.files.audio[0].path)
  console.log('File Uploads - Image Path: ', req.files.image[0].path)

  const music = new Music({
    name: req.body.name,
    author: req.body.author,
    description: req.body.description,
    lyrics: req.body.lyrics,
    image: req.files.image[0].path,
    audio: req.files.audio[0].path,
    user: req.user._id
  })
  console.log(req.body.categories)
  music
    .save()
    .then(() => {
      req.body.categories.forEach((category) => {
        Category.findById(category)
          .then((category) => {
            category.music.push(music)
            music.category.push(category)
            category.save()
            music.save()
          })
          .catch((err) => {
            console.log(err)
          })
      })
      res.redirect('/music/index')
    })
    .catch((err) => {
      console.error(err)
      res.send('Please try again later.', err)
    })
}

exports.music_index_get = (req, res) => {
  const userId = req.user._id
  Music.find()
    .then((musics) => {
      Playlist.find({ user: userId }).then((userPlaylist) => {
        // console.log(musics)
        res.render('music/index', { userPlaylist, musics, moment })
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

//show details of music
exports.music_show_get = (req, res) => {
  console.log(req.query.id)
  Music.findById(req.query.id)
    .populate('category')
    .then((music) => {
      res.render('music/detail', { music, moment })
    })
    .catch((err) => {
      console.log(err)
    })
}
exports.music_delete_get = (req, res) => {
  console.log(req.query.id)
  Music.findByIdAndDelete(req.query.id)
    .then(() => {
      res.redirect('/music/index')
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.music_edit_get = (req, res) => {
  console.log(req.query.id)
  Music.findById(req.query.id)
    .then((music) => {
      res.render('music/edit', { music })
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.music_update_post = (req, res) => {
  console.log(req.body.id)
  console.log('File Uploads - Audio Path: ', req.files.audio[0].path)
  console.log('File Uploads - Image Path: ', req.files.image[0].path)
  console.log('Request Body:', req.body)
  console.log('Uploaded Files:', req.files)

  Music.findByIdAndUpdate(req.body.id, {
    name: req.body.name,
    author: req.body.author,
    description: req.body.description,
    lyrics: req.body.lyrics,
    image: req.files.image[0].path,
    audio: req.files.audio[0].path,
    user: req.user._id
  })
    .then(() => {
      res.redirect('/music/index')
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.music_myLibrary_get = (req, res) => {
  const userId = req.user._id
  Music.find({ user: userId })
    .then((userMusic) => {
      // const userId = req.user._id
      Playlist.find({ user: userId }).then((userPlaylist) => {
        res.render('music/myLibrary', { userPlaylist, userMusic, moment })
      })
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.music_addToPlaylist_get = (req, res) => {
  Playlist.findById(req.query.id)
    .then((playlist) => {
      res.render('playlist/edit', { playlist })
    })
    .catch((err) => {
      console.log(err)
    })
}

exports.music_addToPlaylist_put = (req, res) => {
  Music.findById(req.body.id)
    .then((music) => {
      Playlist.findById(req.body.playlistID)
        .then((playlist) => {
          music.playlist.push(playlist)
          playlist.music.push(music)

          music.save()
          playlist.save()

          res.redirect(`/playlist/detail?id=${req.body.playlistID}`)
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log(err)
    })
}
