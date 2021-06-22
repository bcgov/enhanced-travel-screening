# Details available under last pass - ETS Migration Details - All ENV

> Instructions to perform database migration and validation


### step 1 - Login to bastion host 

ssh -i ~/.ssh/ets_bastion_host.pem ec2-user@ec2-3-96-194-192.ca-central-1.compute.amazonaws.com

### step 2 - Dump the data to EC2 folder
mongodump --ssl --host ets-dev.cluster-cyk1pye3ihk7.ca-central-1.docdb.amazonaws.com:27017 --sslCAFile rds-combined-ca-bundle.pem --username masterdev --password <> --db ets-staging --out dump

### step 3 - quit ssh session and scp copy data to local folder 
scp -r -i ~/.ssh/ets_bastion_host.pem ec2-user@ec2-3-96-194-192.ca-central-1.compute.amazonaws.com:/home/ec2-user/dump ./

### step 4 - open vpn connect 
sudo openvpn --config dev.ovpn

### step 5 - restore to LZ2 cluster - Credentials in SSM 
mongorestore --ssl --host klwrig-test.cluster-cdqa6qyje91a.ca-central-1.docdb.amazonaws.com:27017 --username root --password etstestdbsecure123 --sslCAFile rds-combined-ca-bundle.pem --db ets-test --drop ./dump/ets-staging

### step 6 count verification 

```
mongo --ssl --host ets-dev.cluster-cyk1pye3ihk7.ca-central-1.docdb.amazonaws.com:27017 --sslCAFile rds-combined-ca-bundle.pem --username etsmasterdev --password PASSWORD
use ets-dev
db.getCollectionNames().forEach(function(collection) { resultCount = db[collection].count(); print("Results count for " + collection + ": "+ resultCount); });
```

Do the same on the new database. 