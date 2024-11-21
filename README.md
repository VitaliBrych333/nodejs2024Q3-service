# Home Library Service

# To start:

- clone this repository wiht branch `b develop_part_3`
- open app `cd nodejs2024Q3-service`
- run `npm install --legacy-peer-deps` to install
- `PORT=4000` set in .env file
- `npm run docker:build:up`
  (
    there may be problems with an already allocated port on Windows - then you need to kill the process on it
        - open CMD as Admin
        - netstat -ano | findstr :{port number}
        - find PID number on this port
        - taskkill /PID {PID number} /F
    also there may also be problems with an already running docker container - then stop the container
        - docker container ls
        - docker stop {CONTAINER ID}
    also there may also be problems with running - try doing it first:
        - docker pull vitalibrych333/nodejs2024q3-service-app
  )

- Logs wiil be in the files of the container named 'app', in the app/dist/log

# To run test:
in other terminal parallel
  `npm run test:auth`
  `npm run test:refresh`

# To see swagger doc:

`http://localhost:{'your port'}/doc/`

## Running application

```
npm start
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

## Testing

After application running open new terminal and enter:

To run all tests without authorization

```
npm run test
```

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging
