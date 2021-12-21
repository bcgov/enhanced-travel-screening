## Accessing DB in Dev, Test and Prod

### Prerequisites:

- Setup OpenVPN Client - Preferably with CLI or just GUI. There are plenty of guides that can help with this. 
- Your preferred mongo db interface or Mongo Shell CLI.
- Access and Authorization to LZ2 or Last Pass to get DB details.

### Credentials: 

You will need the following before connecting to any of the environments:

- Open VPN Connection file for the environment
- Database URL 
- DB username
- DB Password 
- AWS DB Connection TLS File - wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem

### Setting Up:

- Get the above listed credentials by logging into Last pass - If you need a new VPN connection file, contact your project devops admin. 
- You should have one `.ovpn` for each environment.
- Start a VPN tunnel. Example: `openvpn --config dev.ovpn`.
- Open your mongo browser / shell and use the DB credentials to connect to the database.

### Guidance for accessing Production: 

- Always access production in pairing mode with another team member for extra set of eyes on each activity. 
- Inform to the team that the database is being accessed.
- All access to VPN is logged.
- Do not persist or store database query results from production on local storage. 
- Querying / Exporting data:
  - Make sure to connect on trusted internet before connecting to VPN / DB.
  - Obtain approval from stakeholders before exporting data.
  - Exported data must always be encrypted and password protected at rest.
  - Make sure all PII PHI is masked or redacted before data snippet or formats are being shared for debugging or other essential reasons.


