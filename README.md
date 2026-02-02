# feature-flag-website
Website to control feature flags

# To run locally
## Run the relay proxy
Run:
```
docker compose --file docker-compose.yaml up -d
```

### Check that the relay proxy is running
Open the browser at `localhost:1031/swagger/` to see the API documentation of the relay proxy.

Authorize with an API key picked from `ff-proxy/goff-proxy.yaml` file.
- `authorizedKeys.admin` allows access to admin APIs.
- `flagSets.flagSet.apiKeys` allows access to flag set APIs.
- After choosing an API key, write it in the format of `Bearer <API key`, and click on "Authorize" button.

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
