# Repository Guidelines

## Project Structure & Module Organization

This repository is organized as a task manager project with separate frontend and backend areas. The current `frontend/` directory is empty and should contain UI source once scaffolded, preferably under `frontend/src/`, with static assets in `frontend/public/` or `frontend/src/assets/` depending on the chosen framework.

The backend lives in `backend/` and is a Spring Boot Maven project. Main configuration is in `backend/src/main/resources/application.yml`; local environment examples are in `backend/.env.example`. Build output and generated artifacts belong in `backend/target/` and should not be edited by hand.

## Build, Test, and Development Commands

Run backend commands from `backend/`:

```bash
./mvnw spring-boot:run
./mvnw test
./mvnw package
```

`spring-boot:run` starts the API locally. `test` runs the Maven test suite. `package` compiles the app, runs tests, generates REST Docs during `prepare-package`, and writes the JAR to `target/`.

When frontend tooling is added, document its package manager and scripts here, for example `npm run dev`, `npm test`, and `npm run build`.

Frontend commands from `frontend/`:

```bash
npm install
npm run dev
npm run build
npm run test
npm run e2e
```

`npm run dev` starts Vite with a `/api` proxy to `http://localhost:8080`. `npm run build` type-checks and builds the React app. `npm run test` runs Vitest unit/component tests. `npm run e2e` runs Playwright tests against the built preview server.

## Coding Style & Naming Conventions

Backend code should follow standard Java and Spring conventions: 4-space indentation, PascalCase classes, camelCase fields and methods, and package names in lowercase. Keep controllers, services, repositories, configuration, and DTOs in separate packages once Java source files are added.

Use Lombok only where it reduces boilerplate clearly. Keep configuration in YAML or `.env` files rather than hardcoding secrets or environment-specific paths.

## Testing Guidelines

Use Maven and Spring Boot test dependencies already declared in `backend/pom.xml`, including Spring Security test and REST Docs support. Place tests under `backend/src/test/java` and name them with the `*Test` suffix. Add focused tests for authentication, secured API behavior, validation, and persistence logic.

Before opening a PR, run:

```bash
cd backend && ./mvnw test
```

## Commit & Pull Request Guidelines

The existing history uses short, direct commit subjects, sometimes in Portuguese, such as `ajuste de doc` and `spring doc added`. Keep commits concise and scoped to one change.

Pull requests should include a brief summary, testing performed, linked issue when applicable, and screenshots or API examples for user-visible changes. Call out configuration changes, migrations, or new required environment variables.

## Security & Configuration Tips

Do not commit real secrets. Use `.env.example` to document required variables. JWT keys should be generated locally and referenced through environment variables such as `JWT_PUBLIC_KEY_LOCATION` and `JWT_PRIVATE_KEY_LOCATION`.
