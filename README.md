# Loopback gateway example #2

A custom modification to the oauth2 module and accesstoken table to achieve a working gateway
with oAuth2, passport, and ACL.

What's different in this example from the original?
The problem with the oauth2 loopback component is the custom definition of
an entirely new table for accesstoken (oauthacesstoken). Hence, the work around is to have that component use the loopback's built-in component. 

By unifying Passport's token creations and oAuth2 with the same model (AccessToken) we have a working example. 

Here are some keyparts that was modified to make this working. 
   * The SQL accesstoken table creation script below, which is a merge of oauth2 and loopback's accesstoken. 
   * Builtin model overrides so that loopback knows about the new columns, under `server/boot/builtin-overrides.js`
   * Passport custom callback and token creation setup. `server/middleware/passport`
   * Custom oAuth2 component [qbanguy/loopback-component-oauth2](https://github.com/qbanguy/loopback-component-oauth2)

SQL Script
```
CREATE TABLE accesstoken
(
  id character varying(1024) NOT NULL,
  appid character varying(1024),
  userid integer,
  created timestamp with time zone,
  expiresin integer,
  ttl integer,
  scopes character varying(1024),
  parameters character varying(1024),
  authorizationcode character varying(1024),
  refreshtoken character varying(1024),
  tokentype character varying(1024),
  hash character varying(1024),
  CONSTRAINT accesstoken_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
```

This might be a nasty hack for some developers, however, the lack of documentation from Strongloop on loopback is messy. If you think this could be improved, please by all means code away! 
