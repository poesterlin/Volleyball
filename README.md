# Course Registration Application

This Repo contains the code for an application created to manage registrations. It uses a serverless backend connected to a serverless MongoDB instance and a static frontend generated using SvelteKit. It has some publicly available options as well as authentication for administrators to access hidden management tools.

## Development

To start a local development version of the frontend run:

```bash
npm install
npm run dev
```

To test serverless functions locally run:

```bash
cd backend
npm i serverless -g
sls invoke local <function name>
```

To upload new email templates run:

```bash
cd backend
npm run build
```

To deploy serverless functions run:

```bash
cd backend
npm run deploy
```

## Frontend Architecture

- `src/app.html`: base HTML config.
- `src/components`: reusable components
- `src/helpers`: reusable helper functions
- `src/routes`: used for the routing of SvelteKit. Each file is exposed as an entrypoint.

