# Visuwisu backend

## Development
- Install the dependency 
```bash
npm i
```

- Copy the `.env.example` to `.env`

### Database schema type generation
Generate the table type automatically
```bash
npx kysely-codegen
```

### Run the development server
```bash
npm run dev
```

## Build
Build the project
```bash
npm run build
```

### Run the built server
There is 2 services available, the main service and notifier service
```bash
npm run start
npm run start:notifier
```

## Testing
- Create `.env.test` and configure the env variable
- Create `.env.test` on laravel zero as well and configure them too
- Testing will migrate the database for mock purpose and then run the actual test and then rollback the database
```bash
npm run migrate -- --env=test && npm run test && npm run rollback -- --env=test
```