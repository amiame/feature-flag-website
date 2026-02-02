- [x] Where to store the feature flag?
- [x] Set up relay proxy
- [ ] Set up a page top page to show a list of environments
- [ ] Set up a second layer page to show the services in the selected environment
- [ ] Set up a page to show the feature flag status for the selected environment
- [ ] Set up a button to toggle the feature flag
- [ ] Set up another page to show the feature flag status for staging 
- [ ] Set up tabs to switch between dev and staging feature flag status
- [ ] Set up a button to toggle the feature flag for staging
- [ ] Set up another page to show the feature flag status for production
- [ ] Set up a button to toggle the feature flag for production
- [ ] Set up tabs to switch between dev, staging, and production feature flag status
- [ ] Set up authentication for accessing website
- [ ] Set up authorization for toggling feature flags in dev, staging, and production

# Where to store the feature flag?
- Let's start small. We'll use a file. When we scale, we can move to a postgres database because we already use it for other things. 

# Set up relay proxy
- Done. Just followed the instructions in https://gofeatureflag.org/docs/relay-proxy/getting_started.

# Set up a page top page to show a list of environments
- Saved flags as a structure of folders inside S3.
