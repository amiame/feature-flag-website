INSERT INTO go_feature_flag (flag_name, flagset, config) VALUES ('my-flag-1', '', '
{
  "variations": {
    "enabled": true,
    "disabled": false
  },
  "targeting": [
    { 
      "name": "Target dev environment",
      "query": "env eq \"dev\"",
      "variation": "enabled"
    },
    {
      "name": "Target stg environment",
      "query": "env eq \"stg\"",
      "variation": "disabled"
    },
    {
      "name": "Target prd environment",
      "query": "env eq \"prd\"",
      "variation": "disabled"
    }
  ],
  "defaultRule": {
    "variation": "disabled"
  }
}
');
