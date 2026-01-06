# feature-flag-website
Website to control feature flags

# To run locally
Run:
```
docker pull gofeatureflag/go-feature-flag:latest
docker run -d --rm -v (pwd)/goff-proxy.yaml:/goff/goff-proxy.yaml -v (pwd)/flags.yaml:/goff/flags.yaml -p 1031:1031 --name ff-proxy gofeatureflag/go-feature-flag
```

Then open the browser at `localhost:1031/swagger/` to see the API documentation.

To evaluate flags per environment, add the following field to the payload of the /v1/feature/<your_flag_name>/eval API, inside the "evaluationContext > custom" object.
```
"env" : "dev" or "stg" or "prd"
```
