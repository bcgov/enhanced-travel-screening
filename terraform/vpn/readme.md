# Usage

This folder contains 2 scripts to ease the process of configuring client VPN 

First create the CA and private keys using `easy-rsa` as instructed in `imports.sh`

once the certificates are generated, we can run imports.sh to import the data into AWS for secure storage. 

Then delete the dir with `rm -rf easy-rsa`


## Creating VPN users. 

To create a VPN user, run `users.sh` with required params for then environment. This generates an OPEN VPN config file in the root of this git repo. 

The config file can be shared with the user for access to VPC.