# Greet
This is the server code for Greet application. Its written in adonis.js which is a framework of node.js.

Link: https://adonisjs.com

## Requirements
* node
* npm
* mysql

## Installation Instruction
Clone the project and run the following commands within the project directory.

```
npm install 
```

Copy `.env.example` as `.env` and change the credentials as required. After, run the database migration using the following command.
```
node ace migration:run
```

Run the server
```
npm run dev
```

You need to install redis server for authentication to work.

