# Backend

## Installation
```bash
$ yarn install
```

No yarn? 
```bash
$ npm install -g yarn
```

No npm? go download XD

## Run

```bash
$ yarn start
```

## Framework
* express & nodemon
    * Web server Framework 
* glob
    * Match files using the patterns the shell uses.
    * Better File Structure of Project
* prisma
    * ORM for database
* crypto
    * for generating token
* cors
    * Enable cross-origin resource sharing
* cookie-parser
    * enable cookies
* express-session
    * enable session to achieve stateful
* bcrypt (not installed)
    * Password hashing for user
* axios
    * API handler
* redis
    * Caching
* swagger-jsdoc
    * API documentation generator
    * https://www.npmjs.com/package/swagger-jsdoc

## Deployment
* kubernetes
    * automating deployment, scaling, and management of containerized applications
* Nginx
    * Load Balancer

## System Architecture

### Basic Architecture

![](images/a.png)

### Advanced Architecture (future work)

![](images/b.png)

## Database relation
https://dbdiagram.io/d/654ba0a67d8bbd6465c4d66c

TBD (will changes to eliminate array)
![](images/db.png)

Model file will located at `prisma/schema.prisma`

## Class/Module Functionality

### Users
1. Register
2. Login
3. getCurrentSessions (Return Users with sessionId)

### Books
TODO

### Rates
1. GetBookRatingById
2. GetUsersRatingById
3. GetRatingById

## API Spec
TODO with swagger