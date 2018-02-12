![Centsa](https://raw.githubusercontent.com/nohorjo/Centsa/master/application/layout/default/logo.svg?sanitize=true)
# Centsa money managing solution
Centsa is a simple personal budgeting application to help you manage your money.  
[Try it out here](https://centsa.herokuapp.com) (Please bear in mind that I'm using the free tier so I have less resources available for the server)

[Check out the Wiki for more information](https://github.com/nohorjo/Centsa/wiki)

## Requirements
You will need access to a mysql server and a database created for Centsa.

## Configuring
Create a `config.js` ([example](config-sample.js)) in the root directory and set the configuration settings in the `config` varable.  
Alternatively you can set these as environment variables.
## Installing
```bash
git clone https://github.com/nohorjo/Centsa.git
cd Centsa
npm install
```
## Running
```bash
# Either
npm run build # Compile .ts to .js
npm start # Run with node

# Or
npm run dev # Run with ts-node-dev
```

Changelog can be found [here](https://github.com/nohorjo/Centsa/wiki/Changelog)
