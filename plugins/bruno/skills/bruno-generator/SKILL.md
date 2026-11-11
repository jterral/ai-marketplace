---
name: bruno-generator
description: Generate Bruno .bru files for new API endpoints. Use automatically when a new controller endpoint is created or when the user asks to create a Bruno request file.
---

# Bruno Request Generator

When a new endpoint is created, generate the corresponding `.bru` file.

## Prerequisites

- **Bruno CLI**: `bru` must be installed for running generated files
- **Bruno project**: `.bruno/` directory must exist at the project root
- **ASP.NET controller**: A controller with route attributes must exist to infer method/route

## File Location

Place the file in `.bruno/{ControllerName}/{ActionName}.bru`

## Template

```bru
meta {
  name: {ActionName}
  type: http
  seq: 1
}

get {
  url: {{baseAddress}}/route
  body: none
  auth: none
}
```

The HTTP block is named after the **lowercase** method (`get`, `post`, `put`, `patch`, `delete`). For a request with a JSON body, set `body: json` in that block, add a `headers` block, and add a `body:json` block holding the payload:

```bru
meta {
  name: CreateUser
  type: http
  seq: 2
}

post {
  url: {{baseAddress}}/users
  body: json
  auth: none
}

headers {
  Content-Type: application/json
}

body:json {
  {
    "name": "Jane Doe"
  }
}
```

## Rules

- Method and route inferred from the controller attributes (`[HttpGet]`, `[HttpPost]`, `[Route]`, etc.)
- The HTTP block name is the lowercase method; `headers` and `body:json` blocks are only present when the request has a body
- `seq`: use the next available number among the `.bru` files already in the target folder (not always `1`)
- Body populated from the request DTO properties if applicable
- No body block for GET/DELETE
- Always use `{{baseAddress}}` for the base URL, never hardcode
- Mirror the controller folder structure inside `.bruno/`
