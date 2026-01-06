# feature-flag-website
Website to control feature flags

# To run locally
## Run the relay proxy
Run:
```
docker pull gofeatureflag/go-feature-flag:latest
docker run -d --rm -v (pwd)/goff-proxy.yaml:/goff/goff-proxy.yaml -v (pwd)/flags.yaml:/goff/flags.yaml -p 1031:1031 --name ff-proxy gofeatureflag/go-feature-flag
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
