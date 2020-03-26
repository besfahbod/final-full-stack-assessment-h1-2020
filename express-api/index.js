const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const BooktonicaDatabase = require('./src/booktonica-database');

/**
 * A way to change the defaults.
 * You can run this app like:
 * `DB_NAME=osito npm start` and it will
 * use the DB named osito instead of DEFAULT_DB_NAME.
 */
const DEFAULT_PORT = 3001;
const PORT = process.env.PORT || DEFAULT_PORT;
const DEFAULT_DB_NAME = 'booktonica';
const dbName = process.env.DB_NAME || DEFAULT_DB_NAME;
/**
 * Creates a new database object.
 * Add new database queries there.
 */
const db = new BooktonicaDatabase(dbName);

const api = express();

// Middlewares
api.use(morgan('tiny'));
api.use(bodyParser.json());

/**
 * This will just print the incoming request bodies
 * which is useful for debugging. You can skip it if you want
 * by removing
 */
const bodyDebugMiddleware = require('./src/body-debug-middleware');
api.use(bodyDebugMiddleware);

// GET /books
api.get('/books', (_unused, res) => {
  db.getAllBooks()
    .then(books => res.send(books))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

api.get('/books/likes', (req, res) => {
  db.getLikeCounts().then(counts => res.send(counts));
});

api.post('/books/:bookId/likes', (req, res) => {
  db.addLike(req.params.bookId, req.body.username)
    .then(() => res.sendStatus(201))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

api.get('/users', (req, res) => {
  db.getAllUsers().then(users => res.send(users));
});

api.put('/users/:username', (req, res) => {
  db.putUser(req.params.username).then(isNewRecord =>
    isNewRecord ? res.sendStatus(201) : res.sendStatus(200)
  );
});

// includes per-user stats like liked book IDs
api.get('/users/:username', (req, res) => {
  db.getUser(req.params.username).then(user => res.send(user));
});

// sanityCheck will make sure the DB is working before listening
db.sanityCheck().then(() => {
  api.listen(PORT, () => {
    console.log(`
    
      📚 booktonica express api listening on port ${PORT}
      
    `);
  });
});
