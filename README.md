# Loopback gateway example #2

A custom modification to the oauth2 module and accesstoken table to achieve a working gateway
with oAuth2, passport, and ACL.





Use the following accesstoken SQL
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