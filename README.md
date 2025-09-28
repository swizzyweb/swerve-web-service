# @swizzyweb/swizzy-backend-template-web-service

This is a sample swizzy backend web service that can be used as the starting point for
your swizzyweb service.

## Documentation:

https://swizzyweb.github.io/swerve-web-service/

## Web service

The Swizzy web service logic can be found in the src directory.

## Running

## Install

```npm
npm install
```

## Build and run immediately

```npm
npm run dev
```

## Only build

```npm
npm run build
```

## Running server after build

```npm
npm run server
```

## With swerve

After build you can just run `swerve` in the root directory.

## With swerve

After build you can just run `swerve` in the root directory.

# Running full stack

```
npm install @swizzyweb/swerve-web-service @swizzyweb/swerve-frontend-web-service
swerve @swizzyweb/swerve-web-service @swizzyweb/swerve-frontend-web-service
```

## Service config

web-service-config.json

```
{
  "port": 3005,
  "services": {
    "Frontend": {
      "servicePath": "../swerve-frontend-web-service/"
    },
    "Backend": {
      "servicePath": "../swerve-web-service/"
    }
  }
}

```

```
swerve --config web-service-config.json
```

## Service

nodeModulesPath - path where node_modules should be stored when installing web services
