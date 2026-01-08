# feature-flag-website
Website to control feature flags

# To run locally
## Run the postgres database
Run:
```
docker compose --file docker-compose.yaml up -d postgres
docker compose --file docker-compose.yaml up -d adminer
```

### Check that the database is running
Open the browser at `localhost:8080` to see the Adminer interface. Use the following credentials to log in:
- System: PostgreSQL
- Server: postgres
- Username: pg
- Password: pg
- Database: ff_db

## Run the relay proxy
Run:
```
docker compose --file docker-compose.yaml up -d ff-proxy
```

### Check that the relay proxy is running
Open the browser at `localhost:1031/swagger/` to see the API documentation of the relay proxy.

Evaluate flags per environment by add the following field to the payload of the /v1/feature/<your_flag_name>/eval API, inside the "evaluationContext > custom" object.
```
"env" : "dev" or "stg" or "prd"
```

Execute the API call to see the flag status. It should reflect the flag value in the `flags.yaml` file for the corresponding environment.

## To run the website
Compile the website with:
```
npx tsc
```

Run the website with:
```
python3 -m http.server
```

Open the browser at `localhost:8000/src` to see the website.
