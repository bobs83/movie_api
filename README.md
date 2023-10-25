# myFlix Server-Side Application

Welcome to the myFlix server-side repository! This project is dedicated to the backend portion of a full-stack JavaScript web application at Careerfoundry.

## Table of Contents

- [Introduction](#introduction)
- [Objective](#objective)
- [Programming Languages](#programming-languages)
- [Frameworks and Libraries](#frameworks-and-libraries)
- [Middleware](#middleware)
- [Database](#database)
- [Tools and Platforms](#tools-and-platforms)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Conclusion](#conclusion)

## Introduction

The myFlix project is a full-stack web application that enables users to interact with a vast collection of movie data. This document outlines the technologies, frameworks, and tools utilized in the server-side component of the project.

## Objective

The goal of this project is to develop a robust and efficient RESTful API using Node.js, Express, and MongoDB. This API will serve as the backbone of the myFlix web application, facilitating interactions with our movie database.

## Programming Languages

- **JavaScript (Node.js):** The backend is built using JavaScript, utilizing Node.js as the runtime.

## Frameworks and Libraries

- **[Express](https://expressjs.com/):** A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **[Mongoose](https://mongoosejs.com/):** An elegant MongoDB object modeling tool designed to work in an asynchronous environment.
- **[Bcrypt](https://www.npmjs.com/package/bcrypt):** A library for hashing passwords.
- **[JSON Web Token (JWT)](https://jwt.io/):** A compact, URL-safe means of representing claims to be transferred between two parties.

## Middleware

- **[Body-Parser](https://www.npmjs.com/package/body-parser):** Parse incoming request bodies in a middleware before your handlers, available under the `req.body` property.
- **[Morgan](https://www.npmjs.com/package/morgan):** HTTP request logger middleware for Node.js.

## Database

- **[MongoDB](https://www.mongodb.com/):** A NoSQL database that stores data in flexible, JSON-like documents.

## Tools and Platforms

- **[Postman](https://www.postman.com/):** An API platform for building and using APIs. Postman simplifies each step of the API lifecycle and streamlines collaboration so you can create better APIs—faster.
- **[Heroku](https://www.heroku.com/):** A platform as a service (PaaS) that enables developers to build, run, and operate applications entirely in the cloud.

## Features

### Essential Features

- **Fetch All Movies:** Access a comprehensive list of movies available.
- **Detailed Movie Information:** Explore in-depth details of specific movies.
- **User Profile Management:** Register, update your profile, and manage your favorite movies with ease.
- **Account Deletion:** Opt to delete your account whenever you wish.

### Optional Features (to be added :)

- **Actor Insights:** Discover the actors behind the movies.
- **Extended Movie Details:** Get to know more about the movies with additional information.
- **To Watch List:** Curate a list of movies you intend to watch.

## API Endpoint overview

Detailed documentation for all API endpoints can be found in the [API Documentation](./public/documentation.html).

### Movies

- `GET /movies`: List all movies.
- `GET /movies/:title`: Fetch details of a specific movie.
- `GET /movies/genres/:genre`: Fetch details of a specific genre.
- `GET /movies/directors/:director`: Fetch details of a specific director.

### Users

- `POST /users`: Register as a new user.
- `PUT /users/:username`: Update user details (authentication required).
- `DELETE /users/:username`: Deregister an existing user (authentication required).
- `POST /users/:username/movies/:movieID`: Add a movie to user's favorites (authentication required).
- `DELETE /users/:username/movies/:movieID`: Remove a movie from user's favorites (authentication required).

### Authentication

- `POST /login`: Log in and receive a JSON web token.

## Testing

I made certain that every API endpoint was tested with Postman, confirming functionality, authentication, authorization, and data accuracy.

## Deployment

This application is hosted on Heroku, making it available worldwide.

## Conclusion

......
