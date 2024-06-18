# Awesome Project Build with TypeORM

Built from the [TypeORM template](https://typeorm.io/#quick-start).

## About

ATTENTION: THIS PROJECT IS IN THE TESTING PHASE AND MAY SOON HAVE AUTOMATED TESTS FOR AT LEAST 1 OF ITS FEATURES.

The idea is to create an API for controlling expenses using Express, TypeScript and TypeORM.

But with that we still have:

- CORS (Cross Origin Resource Sharing)
- Bcrypt (password hash)
- Database using PostgreSQL -> pg package
- Morgan (logging)
- JSON Web Token (authentication)
- Swagger (documentation)
- Yup (validation)

The idea is to use the [Clean Architecture](https://paulallies.medium.com/clean-architecture-typescript-express-api-b90846794998) to organize the folders, but this was slightly modified and remained the way it is currently.

## Execution

Run server

```bash
npm run dev
```

For development environment.

All entities will be automatically migrated to the database, in case of an error, simply restart the server and TypeORM will no longer report any errors and the software already has the entities synchronized.

### Production

For build and production environment: `npm run build` (create dist folder) and `npm start:prod` (optional).

[I prefer pm2...](https://stackoverflow.com/questions/56566580/run-typescript-application-with-pm2)

The build can be used for continuous integration testing.
Every dependabot update a rebuild will be performed and this will test conflicts between dependencies as well.

## License

See [LICENSE.md](LICENSE.md)
