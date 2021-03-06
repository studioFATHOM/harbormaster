# harbormaster

[![Build Status](https://travis-ci.org/StrictlySkyler/harbormaster.svg?branch=master)](https://travis-ci.org/StrictlySkyler/harbormaster)

General notes on things to do and how things work.

Features:

- [x] **Users**, who are able to login, edit their own profiles, and view the status of Lanes
- [x] **Harbormasters**, who can create Users, Ship to all Lanes, and promote Users to Captains or Harbormasters
- [x] **Captains**, who can sent Shipments to Lanes they Ply
- [x] **Lanes**, which represent deployment paths, comprised of Harbors
- [x] **Shipments**, which represent discrete actions at a specific Harbor
- [x] **Harbors**, which represent a specific custom task
- [x] **Logs**, which are the output of Shipments
- [x] **Manifests**, which are passed from lane to lane
- [x] **Salvage Plans**, which are Lanes to be executed when a Shipment fails
- [x] **Shipping**, the act of initiating discreet Shipments to a Lane
- [x] **Plying**, the responsibility of Shipping to a Lane
- [x] **Defining a Lane**, which allows input of individual commands as Harbors
- [x] **Promoting & Demoting Users**, allowing Harbormasters to change roles
- [x] **Hooks**, allowing remote calls to trigger shipments
- [x] **Abort shipment**, canceling a shipment in the middle of it, optionally triggering a Salvage Plan
- [x] **Plugins**, for modular capabilities

TODO:
- Blur bug on form input in harbor
- Convenience methods?
- Charters?

Environment variables you'll want if you run this docker container:

```
MAIL_URL=[username]:[password]@[smtp.someserver.com]:[port]
MONGO_URL=mongodb://[user]:[password]@[mongodb url]:[mongodb port]/[db name, usually "harbormaster"]
ROOT_URL=http[s]://[wherever the app is running][:port]
PORT=[usually 80]
```

Calling webhooks can be done like so:
```
# Can be triggered via RPC, e.g.:
curl \
  -f \
  -H "token: [the token for this user with this lane]" \
  -H "user_id: [the user id]" \
  -X POST [url]/lanes/[lane name]/ship[?key=value]
# Any query passed will be assigned as a prior_manifest on the manifest for the lane
```
